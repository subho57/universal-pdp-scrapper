/* eslint-disable no-param-reassign */
import axios from 'axios';

import type { ScrapperOutput } from '../types/scrapperOutput';

export default class Zgallerie {
  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  async extract(html?: string) {
    if (!html) {
      if (!this.url.includes('zgallerie')) {
        throw new Error('Invalid URL');
      }
      const response = await axios.get(this.url);
      html = response.data as string;
    }
    const re = /<script id="__NEXT_DATA__" type="application\/json">(.+)<\/script>/;
    const result = html.match(re);
    const info = JSON.parse(result?.[1]?.substring(0, result[1].indexOf('</script>')) ?? '');
    const res: ScrapperOutput = {
      product_name: info.props.pageProps.product.name.split('~')[0],
      images: info.props.pageProps.product.images.map((image: any) => image.url_zoom),
      height: info.props.pageProps.product.height?.toString(),
      width: info.props.pageProps.product.width?.toString(),
      depth: info.props.pageProps.product.depth?.toString(),
      price: info.props.pageProps.product.calculated_price?.toString(),
      sku: info.props.pageProps.product.sku?.toString(),
      artist: info.props.pageProps.product.additional_info.artist_name ? info.props.pageProps.product.additional_info.artist_name[0] : '',
      source: 'zgallerie',
      product_url: this.url,
    };
    return res;
  }
}
