import { UniversalPDPScrapper } from './index';

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
      'https://www.wayfair.com/decor-pillows/pdp/17-stories-accent-mirror-w010982467.html?categoryid=416716&placement=1&slot=0&sponsoredid=7452d081d727c60c5e8a23b9ede92d531065b69c39b65d1ae50fd550f1ad9616&_txid=I%2BF9OmSby%2BO9%2B3yiGYexAg%3D%3D&isB2b=0&auctionId=daa4e4ad-e9e4-489e-96de-ff8df334aac2'
    );
    expect(data).toBeDefined();
    expect(data?.images).toBeDefined();
    expect(data?.images?.length).toBeGreaterThan(0);
  }, 100000);

  it('should scrape amazon product page', async () => {
    const client = new UniversalPDPScrapper();
    console.log('>>>>>>>>>>>>>>> Amazon <<<<<<<<<<<<<<<<<');
    const data = await client.scrape(
      'https://www.amazon.com/Zinus-Lorelei-Platforma-Mattress-Foundation/dp/B072Q494TX/ref=sr_1_27?crid=O2PYCD2KTCMC&keywords=BED&qid=1685703382&sprefix=bed%2Caps%2C312&sr=8-27&th=1'
    );
    expect(data).toBeDefined();
    expect(data?.images).toBeDefined();
    expect(data?.images?.length).toBeGreaterThan(0);
  }, 100000);

  it('should scrape another amazon product page', async () => {
    const client = new UniversalPDPScrapper();
    console.log('>>>>>>>>>>>>>>> Amazon 2 <<<<<<<<<<<<<<<<<');
    const data = await client.scrape(
      'https://www.amazon.com/TokeShimi-Bathroom-Non-Rusting-Farmhouse-Minimalist/dp/B0BJ7B6BKZ/ref=sr_1_9?crid=ZS7T47RO3D9N&keywords=MIRROR&qid=1685703450&sprefix=mirror%2Caps%2C300&sr=8-9'
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
});
