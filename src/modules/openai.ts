import { OpenAI } from 'openai';

import { Logger } from '../providers/log';

const logger = new Logger('OpenAIService');

export const getClient = (config: { apiKey: string; organization?: string }) => new OpenAI(config);

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
