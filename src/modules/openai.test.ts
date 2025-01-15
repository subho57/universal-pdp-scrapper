import type { OpenAI } from 'openai';

import CONFIG from '@/config';
import { getHtml } from '@/utils/index';

import { getClient, scrapeUsingAI } from './openai';

describe('scrapeUsingAI', () => {
  let client: OpenAI;

  beforeAll(() => {
    client = getClient({
      apiKey: CONFIG.OPEN_AI.API_KEY,
    });
  });

  const testCases = [
    {
      name: 'IKEA product page',
      url: 'https://www.ikea.com/us/en/p/haegernaes-table-and-4-chairs-antique-stain-pine-70575947/',
    },
    {
      name: 'Wayfair product page',
      url: 'https://www.wayfair.com/decor-pillows/pdp/17-stories-willmetta-accent-mirror-w010982467.html',
    },
    // {
    //   name: 'Amazon product page',
    //   url: 'https://www.amazon.com/Zinus-Lorelei-Platforma-Mattress-Foundation/dp/B072Q494TX/',
    // },
    {
      name: 'Lumas product page',
      url: 'https://www.lumas.com/pictures/sven_fennema/sul_lago-3/',
    },
    {
      name: 'Bedrosians product page',
      url: 'https://www.bedrosians.com/en/product/detail/rothko-tile/?itemNo=100003309&queryid=8a5ac00eb0959d496c0b0b88267ac3d1',
    },
    {
      name: 'Build.com product page',
      url: 'https://www.build.com/fresca-fcb2305-i/s1639278',
    },
  ];

  testCases.forEach(({ name, url }) => {
    it(`should scrape ${name}`, async () => {
      // Get HTML content
      const html = await getHtml(url);
      expect(html).toBeDefined();

      // Scrape using AI
      const result = await scrapeUsingAI(client, url, html);

      // Assertions
      expect(result).toBeDefined();
      expect(result?.product_name).toBeDefined();
      expect(result?.product_url).toBe(url);
      expect(result?.type).toBeDefined();
      expect(result?.price).toBeDefined();
      expect(typeof result?.price).toBe('number');
      expect(result?.height).toBeDefined();
      expect(typeof result?.height).toBe('number');
      expect(result?.width).toBeDefined();
      expect(typeof result?.width).toBe('number');
      expect(result?.depth).toBeDefined();
      expect(typeof result?.depth).toBe('number');
      expect(result?.tags).toBeDefined();
      expect(result?.images).toBeDefined();
      expect(Array.isArray(result?.images)).toBe(true);
      expect(result?.images.length).toBeGreaterThan(0);
      expect(result?.sku).toBeDefined();
      expect(result?.source).toBeDefined();
      expect(result?.description).toBeDefined();
    }, 300000);
  });

  it('should handle invalid URLs', async () => {
    const invalidUrl = 'https://invalid-url.com/product';
    const result = await scrapeUsingAI(client, invalidUrl);
    expect(result).toEqual({
      depth: 0,
      description: '',
      height: 0,
      images: [],
      price: 0,
      product_name: '',
      product_url: 'https://invalid-url.com/product',
      sku: '',
      source: '',
      tags: '',
      type: '',
      width: 0,
    });
  });
});
