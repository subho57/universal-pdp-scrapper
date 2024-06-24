/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
import axios from 'axios';
import type { OpenAI } from 'openai';

import CONFIG from './config';
import { getClient, getCompletion } from './modules/openai';
import { Logger } from './providers/log';
import { Article } from './sources/article';
import { Builddotcom } from './sources/builddotcom';
import { Etsy } from './sources/etsy';
import { Fineartamerica } from './sources/fineartamerica';
import { Google } from './sources/google';
import { Homedepot } from './sources/homedepot';
import { Ikea } from './sources/ikea';
import { Rugsdotcom } from './sources/rugsdotcom';
import { Zgallerie } from './sources/zgallerie';
import type { ScrapperOutput } from './types/scrapperOutput';
import { Types } from './types/scrapperOutput';
import { capitalize, removeNullsAndUndefine } from './utils';

const logger = new Logger('ScrapperClient');

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

const isAnImage = (html: string): boolean => {
  return !html.includes('<html');
};

const getRawData = async (url: string) => {
  try {
    const parsedUrl = new URL(url);
    // @ts-ignore
    let { data: html } = await axios
      .get<string>(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
          'Accept-Encoding': 'gzip, deflate, br',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Origin: parsedUrl.origin,
          Host: parsedUrl.host,
          Connection: 'keep-alive',
        },
      })
      .catch((err) => {
        logger.error('getRawData.axios.get', err.message, err.response);
        return { data: '<html><head><title></title></head></html>' };
      });
    if (typeof html !== 'string') {
      html = JSON.stringify(html);
    }
    if (isAnImage(html)) {
      return {
        images: [url],
        product_url: url,
        product_name: url.split('/').pop()?.split('.').shift(),
        source: 'user-sourced',
      };
    }
    const googleClient = new Google({
      url,
      serpApiKey: CONFIG.SERP.API_KEY,
      googleApiKey: CONFIG.GOOGLE.API_KEY,
      googleCseId: CONFIG.GOOGLE.CSE_ID,
    });
    if (url.includes('article')) {
      return await new Article(url).extract(html).then(async (data) => {
        return {
          ...data,
          images: !data.images?.length ? await googleClient.getImages(data.product_name ?? '') : data.images,
        };
      });
    }
    if (url.includes('build.com')) {
      return await new Builddotcom(url).extract(html).then(async (data) => {
        return {
          ...data,
          images: !data.images?.length ? await googleClient.getImages(data.product_name ?? '') : data.images,
        };
      });
    }
    if (url.includes('etsy')) {
      return await new Etsy(url).extract(html).then(async (data) => {
        return {
          ...data,
          images: !data.images?.length ? await googleClient.getImages(data.product_name ?? '') : data.images,
        };
      });
    }
    if (url.includes('fineartamerica')) {
      return await new Fineartamerica(url).extract(html).then(async (data) => {
        return {
          ...data,
          images: !data.images?.length ? await googleClient.getImages(data.product_name ?? '') : data.images,
        };
      });
    }
    if (url.includes('ikea')) {
      return await new Ikea(url).extract(html).then(async (data) => {
        return {
          ...data,
          images: !data.images?.length ? await googleClient.getImages(data.product_name ?? '') : data.images,
        };
      });
    }
    // if (url.includes('potterybarn')) {
    //   return await new Potterybarn(url).extract(html);
    // }
    if (url.includes('https://rugs.com')) {
      return await new Rugsdotcom(url).extract(html).then(async (data) => {
        return {
          ...data,
          images: !data.images?.length ? await googleClient.getImages(data.product_name ?? '') : data.images,
        };
      });
    }
    // if (url.includes('westelm')) {
    //   return await new Westelm(url).extract(html);
    // }
    if (url.includes('homedepot')) {
      return await new Homedepot(url).extract(html).then(async (data) => {
        return {
          ...data,
          images: !data.images?.length ? await googleClient.getImages(`${data.product_name ?? ''} from homedepot`) : data.images,
        };
      });
    }
    if (url.includes('zgallerie')) {
      return await new Zgallerie(url).extract(html).then(async (data) => {
        return {
          ...data,
          images: !data.images?.length ? await googleClient.getImages(data.product_name ?? '') : data.images,
        };
      });
    }
    return await googleClient.extract(html);
  } catch (error) {
    logger.error('getRawData', (error as any).message);
    return null;
  }
};

export class UniversalPDPScrapper {
  private readonly openAiClient: OpenAI;

  constructor(
    config?: (
      | {
          serpApiKey?: string;
        }
      | {
          googleApiKey?: string;
          googleCseId?: string;
        }
    ) & {
      openaiApiKey?: string;
      openaiOrgId?: string;
      openaiModelId?: string;
    },
  ) {
    if (config?.openaiApiKey) {
      CONFIG.OPEN_AI.API_KEY = config.openaiApiKey;
    }
    if (config?.openaiOrgId) {
      CONFIG.OPEN_AI.ORG_ID = config.openaiOrgId;
    }
    if (config?.openaiModelId) {
      CONFIG.OPEN_AI.MODEL = config.openaiModelId;
    }
    if (config && 'serpApiKey' in config && config.serpApiKey) {
      CONFIG.SERP.API_KEY = config.serpApiKey;
    }
    if (config && 'googleApiKey' in config && config.googleApiKey) {
      CONFIG.GOOGLE.API_KEY = config.googleApiKey;
    }
    if (config && 'googleCseId' in config && config.googleCseId) {
      CONFIG.GOOGLE.CSE_ID = config.googleCseId;
    }

    this.openAiClient = getClient({
      apiKey: CONFIG.OPEN_AI.API_KEY,
      organization: CONFIG.OPEN_AI.ORG_ID,
    });
  }

  scrape = async (url: string) => {
    try {
      const [partialScrapperOutput, openAiOutput] = await Promise.all([
        getRawData(url),
        getCompletion(
          `Consider this url: ${url} and extract the following information: product name, description (a string describing the product in one line such that, when this string is searched in google, it shows similar products), tags (a list of comma separated words relating to the product), product url, type(One of ${Object.values(
            Types,
          ).join(
            ',',
          )}), price(whatever currency converted to us dollar in format XXX.XX), exact height(in inches and upto one decimal place, in XX.X format without any unit), exact width(in inches and upto one decimal place, in XX.X format without any unit), exact depth(in inches and upto one decimal place, in XX.X format without any unit) and structure it properly in json schema like this: { product_name: string; product_url: string; type: string; price: string; height: string; width: string; depth: string; tags: string }`,
          this.openAiClient,
          CONFIG.OPEN_AI.MODEL,
        ),
      ]);
      removeNullsAndUndefine(partialScrapperOutput ?? {});
      let parsedOpenAiOutput: Record<string, any>;
      try {
        parsedOpenAiOutput = openAiOutput ? JSON.parse(openAiOutput ?? '') : {};
      } catch (error: any) {
        logger.error(error.message, openAiOutput);
        parsedOpenAiOutput = {};
      }
      const scrapperOutput = {
        ...parsedOpenAiOutput,
        ...partialScrapperOutput,
        product_name: partialScrapperOutput?.product_name || parsedOpenAiOutput.product_name,
        images: [...(partialScrapperOutput?.images ?? []), ...(parsedOpenAiOutput.images ?? [])],
        description: (partialScrapperOutput?.description ?? '').concat(parsedOpenAiOutput.description ?? ''),
        tags: parsedOpenAiOutput.tags?.toLowerCase(),
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
        scrapperOutput.glb_to_use = scrapperOutput.glbs.find((glb) => glb.includes('.glb')) ?? scrapperOutput.glbs[0];
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
