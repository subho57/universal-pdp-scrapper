/* eslint-disable no-param-reassign */
import axios from 'axios';
import { load } from 'cheerio';

import type { ScrapperOutput } from '@/types/scrapperOutput';

export default class Westelm {
  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  async extract(html?: string) {
    if (!html) {
      if (!this.url.includes('westelm')) {
        throw new Error('Invalid URL');
      }
      const response = await axios.get(this.url);
      html = response.data;
    }
    const $ = load(html!);
    const thumbnail = $.html()?.match(/https:\/\/assets.weimgs.com\/weimgs\/rk\/images\/wcm\/products\/[a-z0-9/-]+.jpg/gm)?.[0];
    const dimension = html?.match(/[\d.]+&quot;w x [\d.]+&quot;d x [\d.]+&quot;h/gm)?.[0];
    const res: ScrapperOutput = {
      product_name: $('h1.heading-title-pip')
        .text()
        .replace(/[\r\n]/gm, '')
        .trim(),
      images: thumbnail ? [thumbnail] : [],
      depth: dimension?.split('x')[1]?.trim()?.replace('&quot;d', ''),
      width: dimension?.split('x')[0]?.trim()?.replace('&quot;w', ''),
      height: dimension?.split('x')[2]?.trim()?.replace('&quot;h', ''),
      price: $(
        '#pip-river-container-WE > div > div > div.product-details > div > div.line-through.price-under-title > ul > li > span.amount'
      )
        .text()
        .replace(/[\r\n]/gm, '')
        .trim(),
      source: 'westelm',
      product_url: this.url,
    };
    return res;
  }
}
