/* eslint-disable no-param-reassign */
import axios from 'axios';
import { load } from 'cheerio';

import type { ScrapperOutput } from '../types/scrapperOutput';

export default class Etsy {
  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  async extract(html?: string) {
    if (!html) {
      if (!this.url.includes('etsy')) {
        throw new Error('Invalid URL');
      }
      const response = await axios.get(this.url);
      html = response.data;
    }
    const $ = load(html!);
    const res: ScrapperOutput = {
      product_name: $('#listing-page-cart > div.wt-mb-xs-2 > h1')
        .text()
        .replace(/[\r\n]/gm, '')
        .trim(),
      images: $(
        '#listing-right-column > div > div.body-wrap.wt-body-max-width.wt-display-flex-md.wt-flex-direction-column-xs > div.image-col.wt-order-xs-1.wt-mb-lg-6 > div > div > div.image-wrapper.wt-position-relative.carousel-container-responsive > div > div.image-carousel-container.wt-position-relative.wt-flex-xs-6.wt-order-xs-2.show-scrollable-thumbnails > ul > li > img'
      )
        .map((_i, el) => $(el).attr('data-src-zoom-image'))
        .get(),
      height: $('#product-details-content-toggle > div > ul > div > div:nth-last-child(1) > li > div')
        .filter((_i, el) => $(el).text().includes('Height'))
        .text()
        ?.split(':')[1]
        ?.trim()
        ?.replace(/\D+/g, ''),
      width: $('#product-details-content-toggle > div > ul > div > div:nth-last-child(1) > li > div')
        .filter((_i, el) => $(el).text().includes('Width'))
        .text()
        ?.split(':')[1]
        ?.trim()
        ?.replace(/\D+/g, ''),
      depth: $('#product-details-content-toggle > div > ul > div > div:nth-last-child(1) > li > div')
        .filter((_i, el) => $(el).text().includes('Depth'))
        .text()
        ?.split(':')[1]
        ?.trim()
        ?.replace(/\D+/g, ''),
      material: $('#legacy-materials-product-details').text()?.split(':').pop()?.trim(),
      price: $(
        '#listing-page-cart > div.wt-mb-xs-6.wt-mb-lg-0 > div:nth-child(1) > div.wt-mb-xs-3 > div.wt-mb-xs-3 > div.wt-display-flex-xs.wt-align-items-center.wt-justify-content-space-between > div.wt-display-flex-xs.wt-align-items-center > p > span:nth-child(2)'
      )
        .text()
        .replace(/[\r\n]/gm, '')
        .trim(),
      sku: this.url.split('/')[this.url.split('/').length - 2],
      artist: $(
        '#desktop_shop_owners_parent > div > div > div.wt-display-flex-xs.wt-align-items-center.wt-mb-xs-2 > div:nth-child(2) > p.wt-text-body-03.wt-line-height-tight.wt-mb-xs-1'
      )
        .text()
        .trim(),
      source: 'etsy',
      product_url: this.url,
    };
    return res;
  }
}
