/* eslint-disable no-param-reassign */
import axios from 'axios';
import { load } from 'cheerio';

import type { ScrapperOutput } from '../types/scrapperOutput';

export class Rugsdotcom {
  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  async extract(html?: string) {
    if (!html) {
      if (!this.url.includes('rugs.com')) {
        throw new Error('Invalid URL');
      }
      const response = await axios.get(this.url);
      html = response.data;
    }
    const $ = load(html!);
    const thumbnail = $('#FullScreenImageGallery > div:nth-child(3) > div > img').attr('src');
    const res: ScrapperOutput = {
      product_name: $(
        '#react-root > div.row.product-display--content-container > div.col-12.col-md-6.pl-md-0.pr-xl-0.product-display--description > div:nth-child(2) > div > div:nth-child(1) > div > h1',
      )
        .text()
        .replace(/[\r\n]/gm, '')
        .trim(),
      images: thumbnail ? [thumbnail.substring(0, thumbnail.indexOf('?'))] : [],
      price: $(
        '#add_to_cart_form > div:nth-child(1) > div > div > div.col-12.px-md-0.d-flex.align-items-center > span.h2-bold-no-margin.price.mr-2',
      )
        .text()
        ?.replace(/[\r\n]/gm, '')
        ?.replace(/\D+/g, '')
        ?.trim(),
      source: 'rugs.com',
      sku: $('#react-root > div.row.d-none.d-md-flex.py-3.product-display--breadcrumbs.width-fixed > div > strong').text()?.trim(),
      product_url: this.url,
    };
    return res;
  }
}
