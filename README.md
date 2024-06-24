# Universal PDP Scrapper - An AI-based Scrapper library for scraping product detail pages

[![NPM](https://img.shields.io/npm/v/universal-pdp-scrapper.svg)](https://www.npmjs.com/package/universal-pdp-scrapper) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![pages-build-deployment](https://github.com/subho57/universal-pdp-scrapper/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/subho57/universal-pdp-scrapper/actions/workflows/pages/pages-build-deployment)

This is a universal PDP scrapper that can scrape any product detail page and extract the following information using ai and custom logic:

```json
product_name?: string;
images?: string[];
height?: string;
width?: string;
depth?: string;
material?: string;
price?: string;
sku?: string;
artist?: string;
type?: Types;
product_url?: string;
source?: string;
glbs?: string[];
glb_to_use?: string;
description?: string;
tags?: string;
'supporting-surface'?: 'floor' | 'wall';
```

Under the hood, it uses OpenAI to extract estimated information from the product page and Google Custom Search JSON API / SerpAPI to extract images from product pages using Google Image Search coupled with Ikea's product search API and some custom scrappers for some popular furniture websites.

## How to use

### 1. Install

```bash
npm i universal-pdp-scrapper
```

### 2. Usage

```typescript
import { UniversalPDPScrapper } from 'universal-pdp-scrapper';

// Initialize the client and set the API keys
// You can set API Keys using environment variables as well: check [.env.sample](./.env.sample)
const client = new UniversalPDPScrapper({
    openaiApiKey: '',
    openaiOrgId: '',
    openaiModelId: '',
    googleApiKey: '',
    googleCseId: ''
});
const result = await client.scrape('https://www.ikea.com/us/en/p/jokkmokk-table-and-4-chairs-antique-stain-50211104/');
console.log(result);
```

### 3. Demo

Here's a demo of running the scrapper in a server environment integrated with a React app

<video loop muted autoPlay playsInline width="100%" height="auto" controlsList="nodownload noremoteplayback noplaybackrate">
  <source src="https://github.com/subho57/universal-pdp-scrapper/assets/55734806/2084481f-8835-4436-98db-e136610a15a4" type="video/mp4">
</video>

### 4. Documentation

Check [here](./docs).

## Features

- [X] Supports ES6 Async/Await
- [X] Supports CommonJS require
- [X] Tree-shakable
- [X] Can be used both in Node and Browser environments
- [X] Written in Typescript
- [X] Uses OpenAI to extract estimated information from the product page
- [X] Uses Google Custom Search JSON API to extract images from product pages using Google Image Search
- [X] Uses Cheerio to scrape custom product pages for some popular websites incl.:
- - amazon.com
- - build.com
- - etsy.com
- - fineartamerica.com
- - homedepot.com
- - ikea.com
- - potterybarn.com
- - rugs.com
- - wayfair.com
- - westelm.com
- - zgallerie.com

**NOTE**: This library doesn't solve the issue of CORS for images or glbs. If you encounter cors, its better to use this library in the server environment and download the images and glbs to your server and serve them from there.

[![universal-pdp-scrapper npminsights.com](https://npminsights.com/api/package/readme-image/universal-pdp-scrapper?v=2023-02-22)](https://npminsights.com/package/universal-pdp-scrapper)

## Module Stats

[See Rollup Visualizer](./stats.html)
