import { Configuration, OpenAIApi } from 'openai';

import CONFIG from '@/config';

const configuration = new Configuration({
  apiKey: CONFIG.OPEN_AI.API_KEY,
  organization: CONFIG.OPEN_AI.ORG_ID,
});

export default new OpenAIApi(configuration);
