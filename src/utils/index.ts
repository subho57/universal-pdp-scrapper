/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */

import axios from 'axios';

// to always return type string event when s may be falsy other than empty-string
export const capitalize = (s: string) => {
  if (!s) {
    return 'Unnamed room';
  }
  // replace / with whitespace
  s = s.replace(/\//g, ' ');
  // replace : with whitespace
  s = s.replace(/:/g, ' ');
  // replace , with whitespace
  s = s.replace(/,/g, ' ');
  // replace - with whitespace
  s = s.replace(/-/g, ' ');
  // replace _ with whitespace
  s = s.replace(/_/g, ' ');
  s = s.replaceAll('  ', ' ');
  // capitalize first letter of each word
  s = s.replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
  // remove any numbers from the end
  s = s.replace(/[\d.]+$/, '');
  return s.trim(); // trim trailing whitespace
};

export function removeNullsAndUndefined(obj: Record<string, any>) {
  for (const propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined || obj[propName] === '') {
      delete obj[propName];
    }
  }
}

interface ParseJSONOptions {
  throwOnError?: boolean;
  defaultValue?: any;
}

/**
 * Parses JSON from a markdown string or plain JSON string
 * @param mdString - The input string containing JSON (with or without markdown formatting)
 * @param options - Configuration options for parsing
 * @returns Parsed JSON object or default value if parsing fails
 * @throws Error if parsing fails and throwOnError is true
 * @examples
 ```typescript
 // With type safety
 interface User {
   name: string;
   age: number;
 }

 // Basic usage
 const user = parseJSONFromMarkdownString<User>(\`
   \`\`\`json
   {
     "name": "John",
     "age": 30
   }
   \`\`\`
 \`);

 // With options
 const userWithFallback = parseJSONFromMarkdownString<User>(
   invalidJson,
   {
     throwOnError: false,
     defaultValue: { name: 'Unknown', age: 0 }
   }
 );

 // Direct JSON parsing
 const plainJsonUser = parseJSONFromMarkdownString<User>('{"name": "John", "age": 30}');
 ```
 */
export function parseJSONFromMarkdownString<T = any>(mdString: string, options: ParseJSONOptions = { throwOnError: true }): T {
  try {
    // Guard against invalid input
    if (!mdString || typeof mdString !== 'string') {
      throw new Error('Input must be a non-empty string');
    }

    // Normalize line endings
    const normalizedString = mdString.replace(/\r\n/g, '\n');

    // Extract JSON content
    let jsonString = normalizedString;
    if (normalizedString.includes('```json')) {
      // Find content between ```json and the next ```
      const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/;
      const matches = normalizedString.match(jsonBlockRegex);

      if (!matches || !matches[1]) {
        throw new Error('Invalid markdown JSON format');
      }
      [, jsonString] = matches;
    }

    // Clean up whitespace and try to parse
    const trimmedString = jsonString.trim();
    const parsed = JSON.parse(trimmedString);

    // Validate that we got a value back
    if (parsed === undefined) {
      throw new Error('Parsing resulted in undefined value');
    }

    return parsed as T;
  } catch (error) {
    if (options.throwOnError) {
      throw new Error(`Failed to parse JSON: ${(error as Error).message}`);
    }
    return options.defaultValue as T;
  }
}

export async function getHtml(url: string) {
  const parsedUrl = new URL(url);
  let { data: html } = await axios
    .get<string>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        Origin: parsedUrl.origin,
        Host: parsedUrl.host,
        Connection: 'keep-alive',
      },
    })
    .catch((err) => {
      console.debug('getHtml.axios.get', err.message, err.response);
      return { data: '<html><head><title></title></head></html>' };
    });
  if (typeof html !== 'string') {
    html = JSON.stringify(html);
  }
  return html;
}
