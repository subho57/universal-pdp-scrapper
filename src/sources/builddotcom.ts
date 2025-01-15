/* eslint-disable no-param-reassign */
import { load } from 'cheerio';

import { getHtml } from '@/utils';

import type { ScrapperOutput } from '../types/scrapperOutput';

export interface ProductJSON {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  productID: string;
  image: string;
  sku: string;
  brand: Brand;
  offers: Offers;
  aggregateRating: AggregateRating;
}

export interface AggregateRating {
  '@type': string;
  ratingValue: number;
  reviewCount: number;
  worstRating: number;
  bestRating: number;
}

export interface Brand {
  '@type': string;
  name: string;
}

export interface Offers {
  '@type': string;
  '@id': string;
  priceCurrency: string;
  price: number;
  sku: string;
  availability: string;
  seller: Brand;
  url: string;
}

export class Builddotcom {
  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  async extract(html?: string) {
    if (!html) {
      if (!this.url.includes('build.com')) {
        throw new Error('Invalid URL');
      }
      html = await getHtml(this.url);
    }
    const $ = load(html!);
    const productJson: ProductJSON = JSON.parse(
      $('#main-content > div.center-ns.mw9-ns.b--theme-grey.bg-theme-white.ba-ns.pa2.pa3-ns.mt3-ns.mb3 > script').text(),
    );
    const thumbnail = productJson.image.replace('t_base,c_lpad,f_auto,dpr_auto,w_1200,h_1200', 't_base');
    const productName = $('#pdp-buysection > div.cf.flex.db-ns.flex-column > div.fl.w-50-ns.order-0 > section > h1 > span.fw2.di-ns')
      .text()
      .replace(/[\r\n]/gm, '')
      .trim();
    const res: ScrapperOutput = {
      product_name: productJson.name,
      images: thumbnail ? [thumbnail] : [],
      price: productJson.offers.price.toString(),
      source: 'build.com',
      sku: productJson.offers.sku,
      product_url: productJson.offers.url,
      artist: productJson.brand.name,
      description: productName,
      'supporting-surface': productJson.description.toLowerCase().includes('wall') ? 'wall' : 'floor',
    };
    return res;
  }
}
