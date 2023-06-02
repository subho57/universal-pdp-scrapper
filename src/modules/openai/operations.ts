import CONFIG from '../../config';
import Logger from '../../providers/log';
import { getClient } from './client';

const logger = new Logger('OpenAIService');

export const getCompletion = async (prompt: string) => {
  try {
    const result = await getClient().createChatCompletion({
      model: CONFIG.OPEN_AI.MODEL,
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

export default { getCompletion };
