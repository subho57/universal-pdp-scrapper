// getProductMetadata.test.ts
import { getProductMetadata } from './client';

describe('getProductMetadata', () => {
  const mockHtml = `
    <html>
      <head>
        <meta property="og:title" content="Test Product" />
        <meta property="og:url" content="https://example.com/product" />
        <meta property="og:type" content="product" />
        <meta property="og:price:amount" content="99.99" />
        <meta property="og:image" content="https://example.com/image1.jpg" />
        <meta property="og:image" content="https://example.com/image2.jpg" />
        <meta property="og:description" content="Test description" />
        <meta property="product:height" content="50" />
        <meta property="product:width" content="30" />
        <meta property="product:depth" content="20" />
        <meta property="product:sku" content="TEST123" />
        <meta property="article:tag" content="furniture,home decor" />

        <script type="application/ld+json">
          {
            "@type": "Product",
            "name": "Schema Product Name",
            "description": "Schema description",
            "image": "https://example.com/schema-image.jpg",
            "offers": {
              "price": "89.99"
            }
          }
        </script>
      </head>
      <body></body>
    </html>
  `;

  it('should extract metadata from OpenGraph tags', () => {
    const sourceUrl = 'https://example.com/product';
    const metadata = getProductMetadata(sourceUrl, mockHtml);

    expect(metadata).toEqual({
      product_name: 'Test Product',
      product_url: 'https://example.com/product',
      type: 'product',
      price: 99.99,
      height: 50,
      width: 30,
      depth: 20,
      tags: 'furniture,home decor',
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      sku: 'TEST123',
      source: 'example.com',
      description: 'Test description',
    });
  });

  it('should handle missing metadata gracefully', () => {
    const emptyHtml = '<html><head></head><body></body></html>';
    const metadata = getProductMetadata('https://example.com', emptyHtml);

    expect(metadata).toEqual({
      product_name: '',
      product_url: 'https://example.com',
      type: '',
      price: 0,
      height: 0,
      width: 0,
      depth: 0,
      tags: '',
      images: [],
      sku: '',
      source: 'example.com',
      description: '',
    });
  });

  it('should extract data from JSON-LD when OpenGraph is not available', () => {
    const htmlWithOnlySchema = `
      <html>
        <head>
          <script type="application/ld+json">
            {
              "@type": "Product",
              "name": "Schema Product Name",
              "description": "Schema description",
              "image": "https://example.com/schema-image.jpg",
              "offers": {
                "price": "89.99"
              }
            }
          </script>
        </head>
        <body></body>
      </html>
    `;

    const metadata = getProductMetadata('https://example.com', htmlWithOnlySchema);

    expect(metadata.product_name).toBe('Schema Product Name');
    expect(metadata.description).toBe('Schema description');
    expect(metadata.images).toContain('https://example.com/schema-image.jpg');
  });

  it('should handle invalid JSON-LD gracefully', () => {
    const htmlWithInvalidSchema = `
      <html>
        <head>
          <script type="application/ld+json">
            Invalid JSON
          </script>
        </head>
        <body></body>
      </html>
    `;

    expect(() => {
      getProductMetadata('https://example.com', htmlWithInvalidSchema);
    }).not.toThrow();
  });

  it('should handle multiple JSON-LD scripts', () => {
    const htmlWithMultipleSchemas = `
      <html>
        <head>
          <script type="application/ld+json">
            {
              "@type": "WebPage",
              "name": "Web Page Name"
            }
          </script>
          <script type="application/ld+json">
            {
              "@type": "Product",
              "name": "Correct Product Name"
            }
          </script>
        </head>
        <body></body>
      </html>
    `;

    const metadata = getProductMetadata('https://example.com', htmlWithMultipleSchemas);
    expect(metadata.product_name).toBe('Correct Product Name');
  });

  it('should handle numeric values correctly', () => {
    const htmlWithNumericValues = `
      <html>
        <head>
          <meta property="product:price:amount" content="199.99" />
          <meta property="product:height" content="100.5" />
          <meta property="product:width" content="50.75" />
          <meta property="product:depth" content="25.25" />
        </head>
        <body></body>
      </html>
    `;

    const metadata = getProductMetadata('https://example.com', htmlWithNumericValues);
    expect(metadata.price).toBe(199.99);
    expect(metadata.height).toBe(100.5);
    expect(metadata.width).toBe(50.75);
    expect(metadata.depth).toBe(25.25);
  });
});
