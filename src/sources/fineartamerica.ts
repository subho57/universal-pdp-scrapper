/* eslint-disable no-param-reassign */
import { load } from 'cheerio';

import { getHtml } from '@/utils';

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
      html = await getHtml(this.url);
    }
    const $ = load(html!);
    const res: ScrapperOutput = {
      product_name: $('#h1title').text().trim(),
      images: [$('#productPreviewImage').attr('src')?.trim() ?? $('#mainimage').attr('src')?.trim()].filter((x) => !!x) as string[],
      material: $('#priceDetailDiv > div:nth-child(2) > p:nth-child(2)').text().trim(),
      price: `${$('#productCurrency').text().trim()} ${$('#productPrice').text().trim()}`,
      artist: $('#artistName > a').text().trim(),
      source: 'fineartamerica',
      product_url: this.url,
    };
    return res;
  }
}
