import type { Tiktoken, TiktokenModel } from 'js-tiktoken';
import { encodingForModel } from 'js-tiktoken';
import { OpenAI } from 'openai';

import { Logger } from '@/providers/log';
import type { ProductMetadata } from '@/types/scrapperOutput';
import { parseJSONFromMarkdownString } from '@/utils';

const logger = new Logger('OpenAIService');

export const getClient = (config: { apiKey: string; organization?: string }) => new OpenAI(config);

/**
 * @deprecated since version 1.2.0. Use {@link scrapeUsingAI} instead
 */
export const getCompletion = async (prompt: string, client: OpenAI, model = 'gpt-4o-mini') => {
  try {
    const result = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: prompt,
        },
      ],
      n: 1,
      temperature: 0,
    });

    return result.choices[0]?.message?.content;
  } catch (err) {
    logger.error('getCompletion', (err as any).message);
    return undefined;
  }
};

const trimToTokenLimit = (text: string, enc: Tiktoken, maxTokens = 128000): string => {
  const tokens = enc.encode(text);

  if (tokens.length <= maxTokens) {
    return text;
  }

  // Calculate how many tokens we need to remove
  // const tokensToRemove = tokens.length - maxTokens;

  // If HTML content exists, trim it from the middle
  if (text.includes('-------')) {
    const parts = text.split('-------');
    const beforeHtml = parts[0] || '';
    const html = parts[1] || '';
    const afterHtml = parts[2] || '';

    // Encode each part to get token counts
    const beforeTokens = enc.encode(beforeHtml).length;
    const afterTokens = enc.encode(afterHtml).length;
    const intermediatoryTokens = enc.encode('-------...[content trimmed]...-------').length;

    // Calculate how much HTML content we can keep
    const availableTokens = maxTokens - beforeTokens - afterTokens - intermediatoryTokens;
    const htmlTokens = enc.encode(html);

    // Take half from the start and half from the end of HTML
    const halfAvailable = Math.floor(availableTokens / 2);
    const startHtml = enc.decode(htmlTokens.slice(0, halfAvailable));
    const endHtml = enc.decode(htmlTokens.slice(-halfAvailable));

    return `${beforeHtml}-------${startHtml}...[content trimmed]...${endHtml}-------${afterHtml}`;
  }

  // If no HTML content, just trim from the end
  const trimmedTokens = tokens.slice(0, maxTokens);
  return enc.decode(trimmedTokens);
};

export const scrapeUsingAI = async (
  client: OpenAI,
  productUrl: string,
  htmlContent?: string,
  userId?: string,
  metadata?: Record<string, string>,
  model = 'gpt-4o-mini',
  trimToMaxToken = 112000, // Adjust based on model
) => {
  const enc = encodingForModel(model as TiktokenModel);
  const systemContext = `You are tasked with a job to accept from a given product URL and optionally its HTML content from the user and return the extracted information in a structured JSON format. You should not prompt the user to provide any additional details; rather, work with the details that are already provided to you.

You should be able to extract the following information:
- **Product Name**
- **Description**: A string describing the product in one line, such that when this string is searched in Google, it shows similar products.
- **Tags**: A list of comma-separated words relating to the product.
- **Product URL**
- **Type**: One of the following: bathtub, bed, bench, bookshelf, cabinet, chair, coffee_table, console_table, day_bed, desk, dressing_table, faucet, floor_lamp, futon, light, loveseat, mattress, mirror, nightstand, painting, plant_stand, rug, side_table, sink, sleeper_sofa, sofa, sofa_bed, stool, storage_unit, study_table, table_lamp, toy, tv_stand, vanity, wall_lamp, wall_mirror, wall_shelf, water_closet.
- **Price**: Converted to US dollars in format XXX.XX.
- **Exact Height**: In inches and up to one decimal place, in XX.X format with unit converted to inches.
- **Exact Width**: In inches and up to one decimal place, in XX.X format with unit converted to inches.
- **Exact Depth**: In inches and up to one decimal place, in XX.X format with unit converted to inches.
- **Images**: A list of image URLs.
- **SKU**
- **Source**: Brand name.

The information should be structured properly in the following JSON schema:

{
  "product_name": string,
  "product_url": string,
  "type": string,
  "price": number,
  "height": number,
  "width": number,
  "depth": number,
  "tags": string,
  "images": string[],
  "sku": string,
  "source": string,
  "description": string
}

# Output Format
Strictly return the extracted information in plain JSON format without any plain text and without any markdown formatting.

# Examples

Example JSON object for the product URL: [https://www.ikea.com/us/en/p/haegernaes-table-and-4-chairs-antique-stain-pine-70575947/]

{
  "product_name": "HÄGERNÄS",
  "product_url": "https://www.ikea.com/us/en/p/haegernaes-table-and-4-chairs-antique-stain-pine-70575947/",
  "type": "table",
  "price": 199.99,
  "height": 29.50,
  "width": 59.10,
  "depth": 35.40,
  "tags": "table, chairs, dining, antique, pine, furniture",
  "images": [
    "https://www.ikea.com/us/en/images/products/haegernaes-table-and-4-chairs-antique-stain-pine__1350925_pe951817_s5.jpg"
  ],
  "sku": "70575947",
  "source": "ikea",
  "description": "This sturdy dining set with a table and four chairs is perfect for your breakfast nook or smaller dining area. Solid pine is a natural material that ages beautifully and acquires its own unique character over time. Each table and chair has its own unique character due to the distinctive grain pattern. For a softer seat or to add a personal touch to the room, complete with a chair pad in the style and color of your choice."
}`;
  let userPrompt = `Here's the product URL: ${productUrl}${
    htmlContent
      ? `\nand the HTML content:
-------
${htmlContent}
-------
`
      : ''
  }`.substring(0, 1048575);

  // Calculate available tokens for user content
  // Typically reserve ~1000 tokens for system context and response
  const reservedTokens = enc.encode(systemContext).length; // Added buffer
  const availableTokens = trimToMaxToken - reservedTokens;

  // Trim content to fit within token limit
  userPrompt = trimToTokenLimit(userPrompt, enc, availableTokens);
  const result = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: systemContext,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    n: 1,
    temperature: 0,
    response_format: {
      type: 'json_object',
    },
    stream: false,
    user: userId,
    metadata,
  });

  return parseJSONFromMarkdownString<ProductMetadata>(result.choices[0]?.message?.content || '');
};
