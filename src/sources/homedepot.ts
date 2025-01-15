/* eslint-disable no-param-reassign */
import { load } from 'cheerio';

import { getHtml } from '@/utils';

import type { ScrapperOutput } from '../types/scrapperOutput';

export interface HomedepotProductStructureData {
  '@context': string;
  '@type': string;
  name: string;
  image: string[];
  description: string;
  productID: string;
  sku: string;
  gtin13: string;
  depth: string;
  height: string;
  width: string;
  color: string;
  weight: string;
  brand: Brand;
  aggregateRating: AggregateRating;
  offers: Offers;
  review: Review[];
}

export interface AggregateRating {
  '@type': string;
  ratingValue: string;
  reviewCount: number;
}

export interface Brand {
  '@type': BrandType;
  name: string;
}

export enum BrandType {
  Brand = 'Brand',
  Person = 'Person',
}

export interface Offers {
  '@type': string;
  url: string;
  priceCurrency: string;
  price: number;
  priceValidUntil: string;
  availability: string;
  hasMerchantReturnPolicy: HasMerchantReturnPolicy;
}

export interface HasMerchantReturnPolicy {
  '@type': string;
  applicableCountry: string;
  returnPolicyCategory: string;
  merchantReturnDays: number;
}

export interface Review {
  '@type': ReviewType;
  reviewRating: ReviewRating;
  author: Brand;
  headline: string;
  reviewBody: string;
}

export enum ReviewType {
  Review = 'Review',
}

export interface ReviewRating {
  '@type': ReviewRatingType;
  ratingValue: number;
  bestRating: string;
}

export enum ReviewRatingType {
  Rating = 'Rating',
}

export class Homedepot {
  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  async extract(html?: string): Promise<ScrapperOutput> {
    if (!html) {
      if (!this.url.includes('homedepot')) {
        throw new Error('Invalid URL');
      }
      html = await getHtml(this.url);
    }
    const $ = load(html!);
    const stringifiedLdJson = $('#thd-helmet__script--productStructureData').html();
    const ldJson: HomedepotProductStructureData = JSON.parse(stringifiedLdJson ?? '');
    return {
      product_name: ldJson.name,
      images: ldJson.image.map((img) => img.replace('_100', '_1024')),
      height: ldJson.height,
      width: ldJson.width,
      depth: ldJson.depth,
      material: ldJson.color,
      price: ldJson.offers.price.toString(),
      sku: ldJson.sku,
      artist: ldJson.brand.name,
      product_url: this.url,
      source: 'homedepot',
      description: ldJson.description,
      tags: 'furniture',
    };
  }
}
