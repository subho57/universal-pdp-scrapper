/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
import axios from 'axios';
import { load } from 'cheerio';

import { UniversalPDPScrapper } from './client';

describe('UniversalPDPScrapper', () => {
  it('should scrape ikea product page', async () => {
    const client = new UniversalPDPScrapper();
    console.log('>>>>>>>>>>>>>>> Ikea <<<<<<<<<<<<<<<<<');
    const data = await client.scrape('https://www.ikea.com/us/en/p/jokkmokk-table-and-4-chairs-antique-stain-50211104/');
    expect(data).toBeDefined();
    expect(data?.images).toBeDefined();
    expect(data?.images?.length).toBeGreaterThan(0);
  }, 100000);

  it('should scrape wayfair product page', async () => {
    const client = new UniversalPDPScrapper();
    console.log('>>>>>>>>>>>>>>> Wayfair <<<<<<<<<<<<<<<<<');
    const data = await client.scrape(
      'https://www.wayfair.com/decor-pillows/pdp/17-stories-accent-mirror-w010982467.html?categoryid=416716&placement=1&slot=0&sponsoredid=7452d081d727c60c5e8a23b9ede92d531065b69c39b65d1ae50fd550f1ad9616&_txid=I%2BF9OmSby%2BO9%2B3yiGYexAg%3D%3D&isB2b=0&auctionId=daa4e4ad-e9e4-489e-96de-ff8df334aac2',
    );
    expect(data).toBeDefined();
    expect(data?.images).toBeDefined();
    expect(data?.images?.length).toBeGreaterThan(0);
  }, 100000);

  it('should scrape amazon product page', async () => {
    const client = new UniversalPDPScrapper();
    console.log('>>>>>>>>>>>>>>> Amazon <<<<<<<<<<<<<<<<<');
    const data = await client.scrape(
      'https://www.amazon.com/Zinus-Lorelei-Platforma-Mattress-Foundation/dp/B072Q494TX/ref=sr_1_27?crid=O2PYCD2KTCMC&keywords=BED&qid=1685703382&sprefix=bed%2Caps%2C312&sr=8-27&th=1',
    );
    expect(data).toBeDefined();
    expect(data?.images).toBeDefined();
    expect(data?.images?.length).toBeGreaterThan(0);
  }, 100000);

  it('should scrape another amazon product page', async () => {
    const client = new UniversalPDPScrapper();
    console.log('>>>>>>>>>>>>>>> Amazon 2 <<<<<<<<<<<<<<<<<');
    const data = await client.scrape(
      'https://www.amazon.com/TokeShimi-Bathroom-Non-Rusting-Farmhouse-Minimalist/dp/B0BJ7B6BKZ/ref=sr_1_9?crid=ZS7T47RO3D9N&keywords=MIRROR&qid=1685703450&sprefix=mirror%2Caps%2C300&sr=8-9',
    );
    expect(data).toBeDefined();
    expect(data?.images).toBeDefined();
    expect(data?.images?.length).toBeGreaterThan(0);
  }, 100000);

  it('should scrape another random product url', async () => {
    const client = new UniversalPDPScrapper();
    console.log('>>>>>>>>>>>>>>> Lumas.com <<<<<<<<<<<<<<<<<');
    const data = await client.scrape('https://www.lumas.com/pictures/sven_fennema/sul_lago-3/');
    expect(data).toBeDefined();
    expect(data?.images).toBeDefined();
    expect(data?.images?.length).toBeGreaterThan(0);
  }, 100000);

  it('should scrape another random product url 2', async () => {
    const client = new UniversalPDPScrapper();
    console.log('>>>>>>>>>>>>>>> Bedrosians.com <<<<<<<<<<<<<<<<<');
    const data = await client.scrape(
      'https://www.bedrosians.com/en/product/detail/slabs/granite-slabs/white-spring-slab/?itemNo=GRNWHTSPRSLAB2P&queryid=3625d43abae91d4efa8a8b1d0b136dc3',
    );
    expect(data).toBeDefined();
    expect(data?.images).toBeDefined();
    expect(data?.images?.length).toBeGreaterThan(0);
  }, 100000);

  it('should scrape build.com product url', async () => {
    const client = new UniversalPDPScrapper();
    console.log('>>>>>>>>>>>>>>> Build.com <<<<<<<<<<<<<<<<<');
    const data = await client.scrape('https://www.build.com/fresca-fcb2305-i/s1639278?uid=3887701&searchId=WMIRnKYWNH');
    expect(data).toBeDefined();
    expect(data?.images).toBeDefined();
    expect(data?.images?.length).toBeGreaterThan(0);
  }, 100000);

  it('batch-eval::should scrape build.com product urls using pagination', async () => {
    const client = new UniversalPDPScrapper();
    console.log('>>>>>>>>>>>>>>> Build.com <<<<<<<<<<<<<<<<<');
    const MAX_PAGE_SIZE = 1;
    const searchUrls = [
      'https://www.build.com/single-bathroom-vanities/c113565?facets=at_nominalwidth_ds:36',
      // 'https://www.build.com/single-bathroom-vanities/c113565?facets=at_nominalwidth_ds:42',
      // 'https://www.build.com/single-bathroom-vanities/c113565?facets=at_nominalwidth_ds:48',
      // 'https://www.build.com/single-bathroom-vanities/c113565?facets=at_nominalwidth_ds:60',
      // 'https://www.build.com/double-bathroom-vanities/c113566?facets=at_nominalwidth_ds:48',
      // 'https://www.build.com/double-bathroom-vanities/c113566?facets=at_nominalwidth_ds:60',
      // 'https://www.build.com/double-bathroom-vanities/c113566?facets=at_nominalwidth_ds:72',
      // 'https://www.build.com/double-bathroom-vanities/c113566?facets=at_nominalwidth_ds:80',
    ];

    const productUrls: string[] = [];

    await Promise.all(
      searchUrls.map(async (url) => {
        let page = 1;
        do {
          let scrapeUrl = url;
          if (page > 1) {
            const paginatedUrl = new URL(url);
            paginatedUrl.searchParams.set('page', page.toString());
            scrapeUrl = paginatedUrl.href;
          }
          const { data: html } = await axios
            .get<string>(scrapeUrl, {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                Connection: 'keep-alive',
              },
            })
            .catch((err) => {
              console.error('getRawData.axios.get', err.message, err.response);
              return { data: 'BREAK' };
            });
          if (html === 'BREAK') {
            break;
          }
          const $ = load(html);
          $(
            '#main-content > div > div.flex.mt3.mt4-l > div.w-100.w-75-l.h-100.relative > div.flex.flex-wrap.ml3-l > div > div > div:nth-child(1) > a',
          ).each((_, el) => {
            const productUrl = `https://www.build.com${$(el).attr('href')}`;
            productUrls.push(productUrl);
          });
          page += 1;
        } while (page <= MAX_PAGE_SIZE);
      }),
    );

    expect(productUrls.length).toBeGreaterThan(0);

    const data = await Promise.all(productUrls.map((productUrl) => client.scrape(productUrl)));
    const formattedData = data.map((el, i) => ({
      prebuilt: `${el?.product_name} - ${el?.description}`,
      type: el?.type,
      image: `=IMAGE(G${i + 2})`, // in-order to visualize the images in Google Sheets
      description: el?.description,
      source_url: el?.product_url,
      tags: el?.tags,
      thumbnail: encodeURI(el?.images?.[0] ?? ''),
      price: el?.price,
      manufacturer: el?.artist,
      sku: el?.sku,
    }));
    console.log(JSON.stringify(formattedData, null, 2));
    expect(formattedData.length).toBeGreaterThan(0);
  }, 862400);
});
