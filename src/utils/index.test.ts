import { parseJSONFromMarkdownString } from './index';

describe('parseJSONFromMarkdownString', () => {
  it('should parse JSON from markdown string with ```json code block', () => {
    const mdString = `
Some markdown text
\`\`\`json
{
  "name": "John",
  "age": 30,
  "city": "New York"
}
\`\`\`
More markdown text
    `;

    const expected = {
      name: 'John',
      age: 30,
      city: 'New York',
    };

    expect(parseJSONFromMarkdownString(mdString)).toEqual(expected);
  });

  it('should parse plain JSON string without markdown', () => {
    const jsonString = '{"name": "John", "age": 30}';
    const expected = {
      name: 'John',
      age: 30,
    };

    expect(parseJSONFromMarkdownString(jsonString)).toEqual(expected);
  });

  it('should handle nested JSON objects', () => {
    const mdString = `
\`\`\`json
{
  "person": {
    "name": "John",
    "address": {
      "city": "New York",
      "country": "USA"
    }
  }
}
\`\`\`
    `;

    const expected = {
      person: {
        name: 'John',
        address: {
          city: 'New York',
          country: 'USA',
        },
      },
    };

    expect(parseJSONFromMarkdownString(mdString)).toEqual(expected);
  });

  it('should throw error for invalid JSON', () => {
    const invalidJson = `
\`\`\`json
{
  "name": "John",
  "age": 30,
}
\`\`\`
    `;

    expect(() => parseJSONFromMarkdownString(invalidJson)).toThrow();
  });

  it('should handle arrays in JSON', () => {
    const mdString = `
\`\`\`json
{
  "names": ["John", "Jane", "Bob"],
  "numbers": [1, 2, 3]
}
\`\`\`
    `;

    const expected = {
      names: ['John', 'Jane', 'Bob'],
      numbers: [1, 2, 3],
    };

    expect(parseJSONFromMarkdownString(mdString)).toEqual(expected);
  });

  it('should return default value when parsing fails and throwOnError is false', () => {
    const defaultValue = { name: 'Default' };
    const result = parseJSONFromMarkdownString('invalid json', { throwOnError: false, defaultValue });
    expect(result).toEqual(defaultValue);
  });

  it('should throw error for invalid input when throwOnError is true', () => {
    expect(() => parseJSONFromMarkdownString('invalid json')).toThrow('Failed to parse JSON');
  });

  it('should handle empty or invalid input', () => {
    expect(() => parseJSONFromMarkdownString('')).toThrow('Input must be a non-empty string');

    expect(() => parseJSONFromMarkdownString(undefined as any)).toThrow('Input must be a non-empty string');
  });

  it('should handle markdown with multiple code blocks', () => {
    const mdString = `
        Some text
        \`\`\`javascript
        const x = 1;
        \`\`\`
        Some other text
        \`\`\`json
        {
          "name": "John"
        }
        \`\`\`
        Final text
      `;

    const result = parseJSONFromMarkdownString(mdString);
    expect(result).toEqual({ name: 'John' });
  });

  // Add a test for more complex cases
  it('should handle JSON with multiple lines and formatting', () => {
    const mdString = `
        # Header
        \`\`\`json
        {
          "person": {
            "name": "John",
            "age": 30,
            "hobbies": [
              "reading",
              "gaming"
            ]
          }
        }
        \`\`\`
      `;

    const result = parseJSONFromMarkdownString(mdString);
    expect(result).toEqual({
      person: {
        name: 'John',
        age: 30,
        hobbies: ['reading', 'gaming'],
      },
    });
  });
});
