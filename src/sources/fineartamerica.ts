/* eslint-disable no-param-reassign */
import axios from 'axios';
import { load } from 'cheerio';

import type { ScrapperOutput } from '../types/scrapperOutput';

export class Fineartamerica {
  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  async extract(html?: string) {
    if (!html) {
      if (!this.url.includes('fineartamerica')) {
        throw new Error('Invalid URL');
      }
      const response = await axios.get(this.url);
      html = response.data;
    }
    const $ = load(html!);
    const res: ScrapperOutput = {
      product_name: $('#h1title').text().trim(),
      images: [$('#productPreviewImage').attr('src')?.trim() ?? ''],
      material: $('#priceDetailDiv > div:nth-child(2) > p:nth-child(2)').text().trim(),
      price: `${$('#productCurrency').text().trim()} ${$('#productPrice').text().trim()}`,
      artist: $('#artistName > a').text().trim(),
      source: 'fineartamerica',
      product_url: this.url,
    };
    return res;
  }
}
