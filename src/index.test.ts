import UniversalPDPScrapper from './index';

describe('UniversalPDPScrapper', () => {
  it('should scrape product page', async () => {
    const scrapper = new UniversalPDPScrapper();
    const data = await scrapper.scrape('https://www.ikea.com/us/en/p/jokkmokk-table-and-4-chairs-antique-stain-50211104/');
    expect(data).toBeDefined();
  });
});
