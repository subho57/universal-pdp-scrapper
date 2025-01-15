/* eslint-disable no-param-reassign */
import axios from 'axios';
import { load } from 'cheerio';

import { Logger } from '../providers/log';
import type { ScrapperOutput } from '../types/scrapperOutput';

// Generated by https://quicktype.io

export interface IkeaProduct {
  catalogRefs?: CatalogRefs;
  currencyCode?: string;
  experimental?: Experimental;
  globalId?: string;
  id?: string;
  mainImage?: Image;
  name?: string;
  pipUrl?: string;
  price?: string;
  priceExclTax?: string;
  priceExclTaxNumeral?: number;
  priceNumeral?: number;
  revampPrice?: RevampPrice;
  styleGroup?: string;
  typeName?: string;
  validDesignText?: string;
}

export interface CatalogRefs {
  products: Products;
  themes: Products;
}

export interface Products {
  elements?: Products[];
  id: string;
  name: string;
  url: string;
}

export interface Experimental {
  contextualImage: Image;
  isBreathTakingItem: boolean;
  isFamilyPrice: boolean;
  isNewLowerPrice: boolean;
  isNewProduct: boolean;
  isTimeRestricted: boolean;
  priceUnit: string;
  rating: Rating;
  technicalCompliance: TechnicalCompliance;
}

export interface Image {
  alt: string;
  id: string;
  imageFileName: string;
  type: string;
  url: string;
}

export interface Rating {
  count: number;
  enabled: boolean;
  maxValue: number;
  percentage: number;
  value: number;
}

export interface TechnicalCompliance {
  valid: boolean;
}

export interface RevampPrice {
  currencyPrefix: string;
  currencySuffix: string;
  currencySuffixZeroDecimals: boolean;
  currencySymbol: string;
  decimals: string;
  hasTrailingCurrency: boolean;
  integer: string;
  numDecimals: number;
  separator: string;
}

// Generated by https://quicktype.io

export interface IkeaModel {
  models: Model[];
  itemType: string;
  categorization: Categorization;
  variations: Variation[];
}

export interface Categorization {
  hfbName: string;
  hfbId: string;
  rangeName: string;
  rangeId: string;
  areaName: string;
  areaId: string;
}

export interface Model {
  markets: string[];
  url: string;
  geoEnabled: boolean;
}

export interface Variation {
  localId: string;
  itemType: string;
  models: Model[];
}

const logger = new Logger('IkeaScrapper');

export class Ikea {
  static readonly BASE_URL = 'https://www.ikea.com';

  readonly url: string;

  readonly sku: string;

  constructor(url: string) {
    this.url = url;
    const { pathname } = new URL(this.url);
    // remote trailing / from pathname
    this.sku = pathname.slice(1).replace(/\/$/, '').split('-').pop()!.replace(/[^\d]/g, '');
  }

  async getProductDetails() {
    try {
      return await axios
        .get<IkeaProduct>(`${Ikea.BASE_URL}/us/en/products/${this.sku.slice(-3)}/${this.sku}.json`)
        .then((response) => response.data);
    } catch (err) {
      logger.error('getProductDetails', (err as any)?.message, (err as any).response?.status, (err as any).response?.data);
      return null;
    }
  }

  async getGLBs() {
    try {
      return await axios
        .get<IkeaModel>(`${Ikea.BASE_URL}/global/assets/rotera/resources/${this.sku}.json`)
        .then((response) => response.data);
    } catch (err) {
      logger.debug('getGLBs', (err as any)?.message, (err as any).response?.status, (err as any).response?.data);
      return null;
    }
  }

  async extract(html?: string) {
    if (!html) {
      if (!this.url.includes('ikea')) {
        throw new Error('Invalid URL');
      }
      const response = await axios.get(this.url);
      html = response.data;
    }
    const [productDetails, glbs] = await Promise.allSettled([this.getProductDetails(), this.getGLBs()]).then(
      (resolvedPromises) =>
        resolvedPromises.map((p) => {
          if (p.status === 'fulfilled') {
            return p.value;
          }
          return null;
        }) as [IkeaProduct | null, IkeaModel | null],
    );
    let res: ScrapperOutput = {};
    if (!productDetails || Object.keys(productDetails).length === 0) {
      const $ = load(html!);
      res = {
        product_name: $(
          '#pip-buy-module-content > div.pip-temp-price-module.pip-temp-price-module--informational.pip-temp-price-module--small.pip-temp-price-module--regular-price-package > div.pip-temp-price-module__information > div > h1 > span.pip-header-section__title--big.notranslate',
        )
          .text()
          .replace(/[\r\n]/gm, '')
          .trim(),
        images: $('.pip-image')
          .map((_i, el) => $(el).attr('src'))
          .get(),
        depth: $(
          '#range-modal-mount-node > div > div:nth-child(3) > div > div.pip-sheets__content-wrapper > div > div > div > div.pip-product-dimensions__dimensions-container > p',
        )
          .filter((_i, el) => !!$(el).html()?.includes('Length'))
          .text()
          ?.split(' ')[0]
          ?.trim()
          ?.replace(/\D+/g, ''),
        width: $(
          '#range-modal-mount-node > div > div:nth-child(3) > div > div.pip-sheets__content-wrapper > div > div > div > div.pip-product-dimensions__dimensions-container > p',
        )
          .filter((_i, el) => !!$(el).html()?.includes('Width'))
          .text()
          ?.split(' ')[0]
          ?.trim()
          ?.replace(/\D+/g, ''),
        height: $(
          '#range-modal-mount-node > div > div:nth-child(3) > div > div.pip-sheets__content-wrapper > div > div > div > div.pip-product-dimensions__dimensions-container > p',
        )
          .filter((_i, el) => !!$(el).html()?.includes('height'))
          .text()
          ?.split(' ')[0]
          ?.trim()
          ?.replace(/\D+/g, ''),
        price: $(
          '#pip-buy-module-content > div.pip-temp-price-module.pip-temp-price-module--informational.pip-temp-price-module--small.pip-temp-price-module--regular-price-package > div.pip-temp-price-module__price > div > span > span:nth-child(1) > span.pip-temp-price__integer',
        )
          .text()
          .replace(/[\r\n]/gm, '')
          .trim(),
        sku: this.sku,
        source: 'ikea',
        product_url: this.url,
        glbs:
          glbs?.models.map((model: Model) => model.url) ??
          Array.from(new Set(html!.match(/https:\/\/web-api\.ikea\.com\/dimma\/assets\/.[^"]*\.glb/g))).sort(),
      };
    } else {
      res = {
        product_name: productDetails?.name,
        images: productDetails?.mainImage?.url ? [productDetails.mainImage.url] : [],
        price: productDetails?.priceNumeral?.toString(),
        sku: this.sku,
        product_url: this.url,
        source: 'ikea',
        glbs: glbs?.models.map((model: Model) => model.url) ?? [],
      };
    }
    return res;
  }
}
