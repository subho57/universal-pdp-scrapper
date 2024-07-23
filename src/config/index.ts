import { config } from 'dotenv';

import pkg from '../../package.json';

config();

export default {
  APP: {
    NAME: pkg.name,
    VERSION: pkg.version,
    DESCRIPTION: pkg.description,
    AUTHOR: pkg.author,
    STAGE: (process.env.NODE_ENV === 'development' ? 'dev' : 'prod') as 'dev' | 'prod',
    ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production',
  },
  SERP: {
    API_KEY: process.env.SERP_API_KEY || '',
  },
  OPEN_AI: {
    API_KEY: process.env.OPEN_AI_SECRET_KEY ?? '',
    ORG_ID: process.env.OPEN_AI_ORG_ID || undefined,
    MODEL: process.env.OPEN_AI_MODEL || 'gpt-4o-mini',
  },
  GOOGLE: {
    API_KEY: process.env.GOOGLE_API_KEY || '',
    CSE_ID: process.env.GOOGLE_CSE_ID || '',
  },
};
