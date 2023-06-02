/* eslint-disable no-param-reassign */
import axios from 'axios';
import { load } from 'cheerio';

import type { ScrapperOutput } from '@/types/scrapperOutput';

export default class Article {
  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  async extract(html?: string) {
    if (!html) {
      if (!this.url.includes('article')) {
        throw new Error('Invalid URL');
      }
      const response = await axios.get(this.url);
      html = response.data;
    }
    const $ = load(html!);
    const dimension = $('#details > div > div.content.desktop.flex-grid > div:nth-child(3) > div > div')
      .html()
      ?.match(/[\d.]+"H x [\d.]+"W x [\d.]+"D/gm)?.[0];
    const res: ScrapperOutput = {
      product_name: $(
        '#app > div > div.app-container-wrapper > div > div > div.product-nav > div.product-nav-desktop.container > div > div.primary-info > div > h2'
      )
        .text()
        .replace(/[\r\n]/gm, '')
        .trim(),
      images: $(
        '#app > div > div.app-container-wrapper > div > div > div.main-layout > div.product-buy-section-container.container.product-page-buy-section > div > div.product-buy-images > div.product-thumbnails-container > div > a.active.product-thumbnail > div > picture > img'
      )
        .map((_i, el) => $(el).attr('src')?.substring(0, $(el).attr('src')?.indexOf('?')))
        .get(),
      depth: dimension?.split('x')[2]?.trim()?.replace(/\D+/g, ''),
      width: dimension?.split('x')[1]?.trim()?.replace(/\D+/g, ''),
      height: dimension?.split('x')[0]?.trim()?.replace(/\D+/g, ''),
      price: $(
        '#app > div > div.app-container-wrapper > div > div > div.product-nav > div.product-nav-desktop.container > div > div.product-navbar-desktop > div.sale-price > div > span'
      )
        .text()
        ?.replace(/[\r\n]/gm, '')
        ?.replace(/\D+/g, '')
        ?.trim(),
      source: 'article',
      product_url: this.url,
    };
    return res;
  }
}
