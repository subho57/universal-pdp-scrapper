import { UniversalPDPScrapper } from './index';

describe('UniversalPDPScrapper', () => {
  it('should scrape ikea product page', async () => {
    const scrapper = new UniversalPDPScrapper();
    const data = await scrapper.scrape('https://www.ikea.com/us/en/p/jokkmokk-table-and-4-chairs-antique-stain-50211104/');
    console.log('ikea', data);
    expect(data).toBeDefined();
  }, 100000);

  it('should scrape wayfair product page', async () => {
    const scrapper = new UniversalPDPScrapper();
    const data = await scrapper.scrape(
      'https://www.wayfair.com/Latitude-Run%C2%AE--Pop-Art-Banksy-Street-Art-Colorful-Graffiti-Wrapped-Canvas-Painting-X121661357-L1318-K~W010550246.html?refid=GX657561891350-W010550246&device=c&ptid=1799860091183&network=g&targetid=pla-1799860091183&channel=GooglePLA&ireid=230120984&fdid=1817&gad=1&gclid=Cj0KCQjw4s-kBhDqARIsAN-ipH0l6s3VFxP5AfWyriJOKgX591VhGWo_I2CrrQRDvez3CwejgRnJx8YaAg8tEALw_wcB'
    );
    console.log('wayfair', data);
    expect(data).toBeDefined();
  }, 100000);

  it('should scrape amazon product page', async () => {
    const scrapper = new UniversalPDPScrapper();
    const data = await scrapper.scrape(
      'https://www.amazon.com/Zinus-Lorelei-Platforma-Mattress-Foundation/dp/B072Q494TX/ref=sr_1_27?crid=O2PYCD2KTCMC&keywords=BED&qid=1685703382&sprefix=bed%2Caps%2C312&sr=8-27&th=1'
    );
    console.log('amazon', data);
    expect(data).toBeDefined();
  }, 100000);

  it('should scrape another amazon product page', async () => {
    const scrapper = new UniversalPDPScrapper();
    const data = await scrapper.scrape(
      'https://www.amazon.com/TokeShimi-Bathroom-Non-Rusting-Farmhouse-Minimalist/dp/B0BJ7B6BKZ/ref=sr_1_9?crid=ZS7T47RO3D9N&keywords=MIRROR&qid=1685703450&sprefix=mirror%2Caps%2C300&sr=8-9'
    );
    console.log('amazon2', data);
    expect(data).toBeDefined();
  }, 100000);
});
