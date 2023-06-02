import { Configuration, OpenAIApi } from 'openai';

import CONFIG from '@/config';

export const getClient = () =>
  new OpenAIApi(
    new Configuration({
      apiKey: CONFIG.OPEN_AI.API_KEY,
      organization: CONFIG.OPEN_AI.ORG_ID,
    })
  );
