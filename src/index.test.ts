import UniversalPDPScrapper from './index';

describe('UniversalPDPScrapper', () => {
  it('should scrape ikea product page', async () => {
    const scrapper = new UniversalPDPScrapper();
    const data = await scrapper.scrape('https://www.ikea.com/us/en/p/jokkmokk-table-and-4-chairs-antique-stain-50211104/');
    expect(data).toBeDefined();
  });

  it('should scrape wayfair product page', async () => {
    const scrapper = new UniversalPDPScrapper();
    const data = await scrapper.scrape(
      'https://www.wayfair.com/rugs/pdp/gracie-oaks-alegre-bordered-power-loom-tan-indooroutdoor-patio-rug-w002905526.html?piid=1346886501'
    );
    expect(data).toBeDefined();
  });

  it('should scrape amazon product page', async () => {
    const scrapper = new UniversalPDPScrapper();
    const data = await scrapper.scrape(
      'https://www.amazon.com/Zinus-Lorelei-Platforma-Mattress-Foundation/dp/B072Q494TX/ref=sr_1_27?crid=O2PYCD2KTCMC&keywords=BED&qid=1685703382&sprefix=bed%2Caps%2C312&sr=8-27&th=1'
    );
    expect(data).toBeDefined();
  });

  it('should scrape another amazon product page', async () => {
    const scrapper = new UniversalPDPScrapper();
    const data = await scrapper.scrape(
      'https://www.amazon.com/TokeShimi-Bathroom-Non-Rusting-Farmhouse-Minimalist/dp/B0BJ7B6BKZ/ref=sr_1_9?crid=ZS7T47RO3D9N&keywords=MIRROR&qid=1685703450&sprefix=mirror%2Caps%2C300&sr=8-9'
    );
    expect(data).toBeDefined();
  });
});
