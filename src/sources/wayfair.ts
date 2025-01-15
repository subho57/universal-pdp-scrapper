/* eslint-disable no-param-reassign */
import { load } from 'cheerio';

import { getHtml } from '@/utils';

import type { ScrapperOutput } from '../types/scrapperOutput';

export class Wayfair {
  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  async extract(html?: string) {
    if (!html) {
      if (!this.url.includes('wayfair')) {
        throw new Error('Invalid URL');
      }
      html = await getHtml(this.url);
    }
    const $ = load(html!);
    const dimensions = $('#CollapsePanel-2 > div > div > div > div > div > div > div > span > dd:nth-child(2) > div')
      .text()
      .trim()
      .split(' x ');
    const res: ScrapperOutput = {
      product_name: $(
        '#bd > div.pl-Wrapper > div.PdpLayoutResponsive-top > div > div.pl-Box--display-flex.pl-Box--pb-0.pl-Box--pb-8-bp960.pl-Box--pt-2.pl-Box--pt-6-bp960.pl-Box--pl-0.pl-Box--pl-4-bp960.pl-Box--fw-wrap.pl-Box--size-12.pl-Box--size-6-bp960.pl-Grid-item.pl-Box--defaultColor > div > div.StyledBox-owpd5f-0.BoxV2___StyledStyledBox-sc-1wnmyqq-0.iNfvtb > div:nth-child(1) > div > header > h1',
      )
        .text()
        .trim(),
      price: $(
        '#bd > div.pl-Wrapper > div.PdpLayoutResponsive-top > div > div.pl-Box--display-flex.pl-Box--pb-0.pl-Box--pb-8-bp960.pl-Box--pt-2.pl-Box--pt-6-bp960.pl-Box--pl-0.pl-Box--pl-4-bp960.pl-Box--fw-wrap.pl-Box--size-12.pl-Box--size-6-bp960.pl-Grid-item.pl-Box--defaultColor > div > div.StyledBox-owpd5f-0.BoxV2___StyledStyledBox-sc-1wnmyqq-0.iNfvtb > div:nth-child(2) > div.SFPrice > div:nth-child(1) > span.pl-Box--display-inline-block.pl-Box--mr-1.pl-Box--pr-1.pl-Price-V2.pl-Price-V2--5000.pl-Box--saleColor',
      )
        .text()
        .trim(),
      images: $(
        '#bd > div.pl-Wrapper > div.PdpLayoutResponsive-top > div > div.pl-Box--display-flex.pl-Box--pb-8-bp960.pl-Box--pt-8-bp960.pl-Box--pr-6-bp960.pl-Box--fd-column.pl-Box--fw-wrap.pl-Box--size-12.pl-Box--size-6-bp960.pl-Grid-item.pl-Box--defaultColor > div.PdpLayoutResponsive-stickyWrap > div > div > div > div.ProductDetailImageCarousel-top > div.ProductDetailImageCarousel-container > div > div > div.pl-MultiCarousel-innerWrap > ul > li > div > div > div > div > div > img',
      )
        .map((_i, el) => $(el).attr('src'))
        .get(),
      height: dimensions[0]?.substring(0, dimensions[0].indexOf("'")),
      width: dimensions[1]?.substring(0, dimensions[1].indexOf("'")),
      depth: dimensions[2]?.substring(0, dimensions[2].indexOf("'")),
      sku: $('#bd > div.pl-Wrapper > div.PdpLayoutResponsive-breadcrumbWrap > div > div > nav > ol > li:nth-last-child(1) > span')
        .text()
        .trim(),
      source: 'wayfair',
      product_url: this.url,
    };
    return res;
  }
}
