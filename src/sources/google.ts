/* eslint-disable no-param-reassign */
import { customsearch } from '@googleapis/customsearch';
import axios from 'axios';
import { load } from 'cheerio';
import { getJson } from 'serpapi';

import CONFIG from '../config';
import Logger from '../providers/log';
import type { ScrapperOutput } from '../types/scrapperOutput';
import { capitalize } from '../utils';

const logger = new Logger('googleScrapper');

export default class Google {
  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  async extract(html?: string) {
    try {
      if (!html) {
        const response = await axios.get(this.url);
        html = response.data;
      }
      const parsedURL = new URL(this.url);
      const domain = parsedURL.hostname.replace('www.', '');
      const domainParts = domain.split('.');
      const pathName = parsedURL.pathname.replaceAll('/', ' ').trim();
      const $ = load(html!);
      const title = `${capitalize(`${pathName} ${$('head > title').text().trim()}`)}`
        .toLowerCase()
        .replace(/\b(?![\w\d]+\b)[^\s]+\b/g, '')
        .replace(domainParts.at(-2) ?? '', '')
        .replace(/\s{2,}/g, ' ')
        .split(' ')
        .filter(
          (word) =>
            !(
              word.includes('0') ||
              word.includes('1') ||
              word.includes('2') ||
              word.includes('3') ||
              word.includes('4') ||
              word.includes('5') ||
              word.includes('6') ||
              word.includes('7') ||
              word.includes('8') ||
              word.includes('9') ||
              word.includes('&') ||
              word.includes('|') ||
              word.includes('=')
            )
        )
        .join(' ')
        .trim();
      const processedTitle = Array.from(new Set(`${title} from ${domain}`.toLowerCase().split(' '))).join(' ');
      const results: any = CONFIG.SERP.USE_SERP_API
        ? await getJson('google', {
            api_key: CONFIG.SERP.API_KEY,
            q: processedTitle,
            gl: 'us',
            hl: 'en',
            tbm: 'isch',
            filter: '1',
            google_domain: 'google.com',
            location: 'California, United States',
          })
        : await customsearch('v1').cse.list(
            {
              auth: CONFIG.GOOGLE.API_KEY,
              q: processedTitle, // .replace(/\s+/g, '+'),
              cr: 'countryUS',
              cx: CONFIG.GOOGLE.CSE_ID,
              gl: 'us',
              hl: 'en',
              // lr: 'lang_en',
              filter: '1',
              num: 5,
              // safe: 'high',
              searchType: 'image',
            },
            {
              http2: true,
            }
          );
      const res: ScrapperOutput = {
        images: CONFIG.SERP.USE_SERP_API
          ? (results.images_results.slice(0, 3) ?? []).map((image: any) => image.original)
          : results.data.items?.map((item: any) => item.link!) ?? [],
        product_name: capitalize(title),
        source: domainParts.at(-2),
        product_url: this.url,
      };
      return res;
    } catch (error) {
      logger.error('extract', (error as any)?.message ?? error);
      throw error;
    }
  }
}
