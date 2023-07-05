/* eslint-disable no-param-reassign */
import axios from 'axios';
import { load } from 'cheerio';

import type { ScrapperOutput } from '../types/scrapperOutput';

export class Potterybarn {
  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  async extract(html?: string) {
    if (!html) {
      if (!this.url.includes('potterybarn')) {
        throw new Error('Invalid URL');
      }
      const response = await axios.get(this.url);
      html = response.data;
    }
    const $ = load(html!);
    const res: ScrapperOutput = {
      product_name: $('#main-content > div.purchasing-container > div.pip-info > div > h1')
        .text()
        .replace(/[\r\n]/gm, '')
        .trim(),
      images: $('div.ossa8632-dummyheroimg > img')
        .map((_i, el) => $(el).attr('src'))
        .get(),
      source: 'potterybarn',
      product_url: this.url,
    };
    return res;
  }
}
