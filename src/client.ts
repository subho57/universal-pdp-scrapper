/* eslint-disable no-restricted-syntax */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
import { load } from 'cheerio';
import type { OpenAI } from 'openai';

import CONFIG from './config';
import { getClient, scrapeUsingAI } from './modules/openai';
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
import type { ProductMetadata, ScrapperOutput } from './types/scrapperOutput';
import { Types } from './types/scrapperOutput';
import { capitalize, getHtml, removeNullsAndUndefined } from './utils';

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

export const getRawData = async (url: string, html: string) => {
  try {
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

export const getProductMetadata = (sourceUrl: string, html: string): ProductMetadata => {
  try {
    const $ = load(html);

    // Extract Schema.org JSON-LD data
    let schemaData: any = {};
    try {
      const jsonLdScripts = $('script[type="application/ld+json"]');
      jsonLdScripts.each((_, element) => {
        try {
          const data = JSON.parse($(element).html() || '{}');
          // Look for Product or WebPage type schemas
          if (data['@type'] === 'Product' || data['@type'] === 'WebPage') {
            schemaData = data;
          }
          // Handle array of schemas
          if (Array.isArray(data)) {
            data.forEach((item) => {
              if (item['@type'] === 'Product' || item['@type'] === 'WebPage') {
                schemaData = item;
              }
            });
          }
        } catch (e) {
          console.warn('Error parsing JSON-LD script:', e);
        }
      });
    } catch (e) {
      console.warn('Error extracting Schema.org data:', e);
    }

    // Helper function to get meta content with multiple fallbacks
    const getMetaContent = (ogTag: string, twitterTag: string, schemaPath: string[]): string => {
      // Try OpenGraph
      const ogContent = $(`meta[property="${ogTag}"]`).attr('content') || $(`meta[name="${ogTag}"]`).attr('content');
      if (ogContent) return ogContent;

      // Try Twitter
      const twitterContent = $(`meta[name="${twitterTag}"]`).attr('content');
      if (twitterContent) return twitterContent;

      // Try Schema.org
      let schemaContent = schemaData;
      for (const path of schemaPath) {
        schemaContent = schemaContent?.[path];
        if (!schemaContent) break;
      }
      return typeof schemaContent === 'string' ? schemaContent : '';
    };

    // Helper function to get numeric content with fallbacks
    const getNumericMetaContent = (ogTag: string, twitterTag: string, schemaPath: string[]): number => {
      const value = getMetaContent(ogTag, twitterTag, schemaPath);
      return value ? parseFloat(value) : 0;
    };

    // Initialize and populate images array with fallbacks
    const images: string[] = [];

    // Try OG images
    $('meta[property="og:image"]').each((_, element) => {
      const imageUrl = $(element).attr('content');
      if (imageUrl && !images.includes(imageUrl)) {
        images.push(imageUrl);
      }
    });

    // If no OG images, try Twitter images
    if (images.length === 0) {
      $('meta[name="twitter:image"]').each((_, element) => {
        const imageUrl = $(element).attr('content');
        if (imageUrl && !images.includes(imageUrl)) {
          images.push(imageUrl);
        }
      });
    }

    // If still no images, try Schema.org images
    if (images.length === 0 && schemaData.image) {
      const schemaImages = Array.isArray(schemaData.image) ? schemaData.image : [schemaData.image];

      schemaImages.forEach((img: string) => {
        if (img && !images.includes(img)) {
          images.push(img);
        }
      });
    }

    // Get source domain from URL if available
    const source = sourceUrl ? new URL(sourceUrl).hostname : '';

    // Price extraction with Schema.org fallback
    const priceString =
      getMetaContent('og:price:amount', 'twitter:price:amount', ['offers', 'price']) ||
      getMetaContent('product:price:amount', 'twitter:price', ['price']);

    // Create the metadata object with all fallbacks
    const metadata: ProductMetadata = {
      product_name: getMetaContent('og:title', 'twitter:title', ['name']),
      product_url: getMetaContent('og:url', 'twitter:url', ['url']) || sourceUrl,
      type: getMetaContent('og:type', 'twitter:card', ['@type']),
      price: parseFloat(priceString) || 0,
      height: getNumericMetaContent('product:height', 'twitter:height', ['height', 'value']),
      width: getNumericMetaContent('product:width', 'twitter:width', ['width', 'value']),
      depth: getNumericMetaContent('product:depth', 'twitter:depth', ['depth', 'value']),
      tags: getMetaContent('article:tag', 'twitter:label', ['keywords']),
      images,
      sku: getMetaContent('product:sku', 'twitter:data1', ['sku']),
      source,
      description: getMetaContent('og:description', 'twitter:description', ['description']),
    };

    return metadata;
  } catch (error) {
    console.error('Error processing content:', error);
    throw error;
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
      const htmlContent = await getHtml(url);
      const productMetadata = getProductMetadata(url, htmlContent);
      const [partialScrapperOutput, parsedOpenAiOutput] = await Promise.all([
        getRawData(url, htmlContent),
        scrapeUsingAI(this.openAiClient, url, htmlContent, undefined, undefined, CONFIG.OPEN_AI.MODEL).catch(() => ({}) as ProductMetadata),
      ]);
      removeNullsAndUndefined(partialScrapperOutput ?? {});
      const scrapperOutput = {
        ...parsedOpenAiOutput,
        ...productMetadata,
        ...partialScrapperOutput,
        product_name: parsedOpenAiOutput.product_name || productMetadata.product_name || partialScrapperOutput?.product_name,
        images: Array.from(
          new Set([...(productMetadata.images || []), ...(parsedOpenAiOutput.images ?? []), ...(partialScrapperOutput?.images ?? [])]),
        ),
        description: (partialScrapperOutput?.description ?? '').concat(parsedOpenAiOutput.description ?? ''),
        tags: parsedOpenAiOutput.tags?.toLowerCase(),
        height: Number(
          (parsedOpenAiOutput.height || partialScrapperOutput?.height || productMetadata.height).toString().replace(/[^\d.]/g, ''),
        ).toFixed(2),
        width: Number(
          (parsedOpenAiOutput.width || partialScrapperOutput?.width || productMetadata.width).toString().replace(/[^\d.]/g, ''),
        ).toFixed(2),
        depth: Number(
          (parsedOpenAiOutput.depth || partialScrapperOutput?.depth || productMetadata.depth).toString().replace(/[^\d.]/g, ''),
        ).toFixed(2),
        price: Number(
          (parsedOpenAiOutput.price || partialScrapperOutput?.price || productMetadata.price).toString().replace(/[^\d.]/g, ''),
        ).toFixed(2),
      } as ScrapperOutput;
      if (!scrapperOutput) {
        throw new Error('Scrapper failed');
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
