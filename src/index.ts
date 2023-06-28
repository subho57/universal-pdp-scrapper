/* eslint-disable class-methods-use-this */
/* eslint-disable no-await-in-loop */
import Scrapper from './client';
import CONFIG from './config';
import { getClient as getOpenAiClient } from './modules/openai/client';
import { getCompletion } from './modules/openai/operations';
import Logger from './providers/log';
import Article from './sources/article';
import Etsy from './sources/etsy';
import Fineartamerica from './sources/fineartamerica';
import Google from './sources/google';
import Ikea, {
  CatalogRefs,
  Categorization,
  Experimental,
  IkeaModel,
  IkeaProduct,
  Image,
  Model,
  Products,
  Rating,
  RevampPrice,
  TechnicalCompliance,
  Variation,
} from './sources/ikea';
import Potterybarn from './sources/potterybarn';
import Rugsdotcom from './sources/rugsdotcom';
import Wayfair from './sources/wayfair';
import Westelm from './sources/westelm';
import Zgallerie from './sources/zgallerie';
import type { ScrapperOutput } from './types/scrapperOutput';
import { Types } from './types/scrapperOutput';
import { capitalize, removeNullsAndUndefine } from './utils';

const logger = new Logger('scrapperService');

const determineType = (searchString: string) => {
  try {
    const allTags = capitalize(searchString).toLocaleLowerCase();
    const allModelTypes = Object.values(Types);
    const determinedType = allModelTypes.find((type) => {
      const typeTags = type.toLocaleLowerCase().split('_');
      return typeTags.some((tag) => allTags.includes(tag));
    });
    return determinedType as Types | undefined;
  } catch (err) {
    logger.error('determineType', (err as any).message);
    return undefined;
  }
};

export class UniversalPDPScrapper {
  constructor(
    config?: (
      | {
          serpApiKey?: string;
          useSerpApi?: boolean;
        }
      | {
          googleApiKey?: string;
          googleCseId?: string;
        }
    ) & {
      openaiApiKey?: string;
      openaiOrgId?: string;
      openaiModelId?: string;
    }
  ) {
    if (!config) {
      return;
    }
    if (config.openaiApiKey) {
      CONFIG.OPEN_AI.API_KEY = config.openaiApiKey;
    }
    if (config.openaiOrgId) {
      CONFIG.OPEN_AI.ORG_ID = config.openaiOrgId;
    }
    if (config.openaiModelId) {
      CONFIG.OPEN_AI.MODEL = config.openaiModelId;
    }
    if ('serpApiKey' in config && config.serpApiKey) {
      CONFIG.SERP.API_KEY = config.serpApiKey;
    }
    if ('useSerpApi' in config && config.useSerpApi) {
      CONFIG.SERP.USE_SERP_API = config.useSerpApi;
    }
    if ('googleApiKey' in config && config.googleApiKey) {
      CONFIG.GOOGLE.API_KEY = config.googleApiKey;
    }
    if ('googleCseId' in config && config.googleCseId) {
      CONFIG.GOOGLE.CSE_ID = config.googleCseId;
    }
  }

  scrape = async (url: string) => {
    try {
      const [partialScrapperOutput, openAiOutput] = await Promise.all([
        Scrapper.scrape(url),
        getCompletion(
          `Consider this url: ${url} and extract the following information: product name, product url, type(One of ${Object.values(
            Types
          ).join(
            ','
          )}), price(whatever currency converted to us dollar in format XXX.XX), exact height(in inches and upto one decimal place, in XX.X format without any unit), exact width(in inches and upto one decimal place, in XX.X format without any unit), exact depth(in inches and upto one decimal place, in XX.X format without any unit) and structure it properly in json like this: { product_name, product_url, type, price, height, width, depth }`
        ),
      ]);
      removeNullsAndUndefine(partialScrapperOutput ?? {});
      const scrapperOutput = {
        ...(openAiOutput ? JSON.parse(openAiOutput) : {}),
        ...partialScrapperOutput,
      } as ScrapperOutput;
      if (!scrapperOutput) {
        throw new Error('Scrapper failed');
      }
      if (scrapperOutput.price) {
        scrapperOutput.price = Number(scrapperOutput.price.replace(/[^\d.]/g, '')).toFixed(2);
      }
      if (scrapperOutput.height) {
        scrapperOutput.height = Number(scrapperOutput.height.replace(/[^\d.]/g, '')).toFixed(2);
      }
      if (scrapperOutput.width) {
        scrapperOutput.width = Number(scrapperOutput.width.replace(/[^\d.]/g, '')).toFixed(2);
      }
      if (scrapperOutput.depth) {
        scrapperOutput.depth = Number(scrapperOutput.depth.replace(/[^\d.]/g, '')).toFixed(2);
      }
      if (!scrapperOutput.type) {
        scrapperOutput.type = determineType(`${scrapperOutput.product_name} ${scrapperOutput.product_url}`) ?? Types.PAINTING;
      }
      if (scrapperOutput.glbs) {
        scrapperOutput.glb_to_use = scrapperOutput.glbs.pop();
        delete scrapperOutput.glbs;
      }
      scrapperOutput['supporting-surface'] =
        scrapperOutput.type === Types.PAINTING || scrapperOutput.type.includes('wall_') ? 'wall' : 'floor';
      logger.info('scrape', scrapperOutput);
      scrapperOutput.images = scrapperOutput.images?.slice(0, 5) ?? [];
      return scrapperOutput;
    } catch (err) {
      logger.error('scrape', (err as any).message);
      return null;
    }
  };
}

export {
  Article,
  CatalogRefs,
  Categorization,
  Etsy,
  Experimental,
  Fineartamerica,
  getOpenAiClient,
  Google,
  Ikea,
  IkeaModel,
  IkeaProduct,
  Image,
  Model,
  Potterybarn,
  Products,
  Rating,
  RevampPrice,
  Rugsdotcom,
  ScrapperOutput,
  TechnicalCompliance,
  Types,
  Variation,
  Wayfair,
  Westelm,
  Zgallerie,
};
