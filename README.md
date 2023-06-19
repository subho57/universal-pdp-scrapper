# Universal PDP Scrapper

[![NPM](https://img.shields.io/npm/v/universal-pdp-scrapper.svg)](https://www.npmjs.com/package/universal-pdp-scrapper) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

This is a universal PDP scrapper that can scrape any product page and extract the following information:

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
'supporting-surface'?: 'floor' | 'wall';
```

## How to use

### 1. Install

```bash
npm i universal-pdp-scrapper
```

### 2. Demo

Here's a demo of running the scrapper in a server environment integrated with a React app

<video loop muted autoPlay playsInline width="100%" height="auto" controlsList="nodownload noremoteplayback noplaybackrate">
  <source src="https://github.com/subho57/universal-pdp-scrapper/assets/55734806/2084481f-8835-4436-98db-e136610a15a4" type="video/mp4">
</video>

## Features

- [x] Supports ES6 Async/Await
- [x] Supports CommonJS require
- [x] Can be used both in Node and Browser environments.
- [x] Written in Typescript
- [x] Uses OpenAI to extract estimated information from the product page
- [x] Uses SerpAPI to extract images from product pages using Google Image Search
- [x] Uses Cheerio to scrape product pages for some popular websites.

**NOTE**: This library doesn't solve the issue of CORS for images or glbs. If you encounter cors, its better to use this library in the server environment and download the images and glbs to your server and serve them from there.

[![universal-pdp-scrapper npminsights.com](https://npminsights.com/api/package/readme-image/universal-pdp-scrapper?v=2023-02-22)](https://npminsights.com/package/universal-pdp-scrapper)
