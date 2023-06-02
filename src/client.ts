/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
import axios from 'axios';

import Logger from './providers/log';
import Article from './sources/article';
import Etsy from './sources/etsy';
import Fineartamerica from './sources/fineartamerica';
import Google from './sources/google';
import Ikea from './sources/ikea';
import Potterybarn from './sources/potterybarn';
import Rugsdotcom from './sources/rugsdotcom';
import Wayfair from './sources/wayfair';
import Westelm from './sources/westelm';
import Zgallerie from './sources/zgallerie';

const logger = new Logger('ScrapperClient');

export default class Scrapper {
  static Article = Article;

  static Etsy = Etsy;

  static Fineartamerica = Fineartamerica;

  static Google = Google;

  static Ikea = Ikea;

  static Potterybarn = Potterybarn;

  static Rugsdotcom = Rugsdotcom;

  static Wayfair = Wayfair;

  static Westelm = Westelm;

  static Zgallerie = Zgallerie;

  static isAnImage(html: string): boolean {
    return !html.includes('<html');
  }

  static async scrape(url: string) {
    try {
      // @ts-ignore
      let { data: html } = await axios.get<string>(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
          Accept: '*/*',
          'Accept-Encoding': 'gzip, deflate, br',
          Connection: 'keep-alive',
        },
      });
      if (typeof html !== 'string') {
        html = JSON.stringify(html);
      }
      if (this.isAnImage(html)) {
        return {
          images: [url],
          product_url: url,
          product_name: url.split('/').pop()?.split('.').shift(),
          source: 'user-sourced',
        };
      }
      if (url.includes('article')) {
        return await new this.Article(url).extract(html);
      }
      if (url.includes('etsy')) {
        return await new this.Etsy(url).extract(html);
      }
      if (url.includes('fineartamerica')) {
        return await new this.Fineartamerica(url).extract(html);
      }
      if (url.includes('ikea')) {
        return await new this.Ikea(url).extract(html);
      }
      // if (url.includes('potterybarn')) {
      //   return await new this.Potterybarn(url).extract(html);
      // }
      if (url.includes('https://rugs.com')) {
        return await new this.Rugsdotcom(url).extract(html);
      }
      // if (url.includes('westelm')) {
      //   return await new this.Westelm(url).extract(html);
      // }
      if (url.includes('zgallerie')) {
        return await new this.Zgallerie(url).extract(html);
      }
      return await new this.Google(url).extract(html);
    } catch (error) {
      logger.error('scrape', (error as any).message);
      return null;
    }
  }

  static scrapeAll(urls: string[]) {
    const promises = urls.map((url) => this.scrape(url));
    return Promise.all(promises);
  }
}
