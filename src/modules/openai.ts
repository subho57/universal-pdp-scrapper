import { Configuration, OpenAIApi } from 'openai';

import { Logger } from '../providers/log';

const logger = new Logger('OpenAIService');

export const getClient = (config: { apiKey: string; organization?: string }) => new OpenAIApi(new Configuration(config));

export const getCompletion = async (prompt: string, client: OpenAIApi, model = 'gpt-3.5-turbo-0301') => {
  try {
    const result = await client.createChatCompletion({
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

    return result.data.choices[0]?.message?.content;
  } catch (err) {
    logger.error('getCompletion', (err as any).message);
    return undefined;
  }
};
