/* eslint-disable no-param-reassign */
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

  private readonly API_KEY: string;

  constructor(url: string) {
    this.url = url;
    this.API_KEY = CONFIG.SERP.API_KEY;
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
      const title = `${capitalize(pathName)} ${$('head > title').text().trim()}`.replace(/\d+$/, '');
      const results = await getJson('google', {
        api_key: this.API_KEY,
        q: [...new Set(`${title} from ${domain}`.toLowerCase().split(' '))].join(' '),
        gl: 'us',
        hl: 'en',
        tbm: 'isch',
        filter: '1',
        google_domain: 'google.com',
        location: 'California, United States',
      });
      logger.info('extract.results', results);
      if (!results?.images_results?.length) {
        throw new Error("Couldn't process URL");
      }
      const res: ScrapperOutput = {
        images: (results.images_results.slice(0, 3) ?? []).map((image: any) => image.original),
        product_name: title,
        source: domainParts[domainParts.length - 2],
        product_url: this.url,
      };
      return res;
    } catch (error) {
      logger.error('extract', (error as any)?.message ?? error);
      throw error;
    }
  }
}
