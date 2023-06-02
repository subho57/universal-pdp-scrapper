/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
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

export function removeNullsAndUndefine(obj: Record<string, any>) {
  for (const propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined || obj[propName] === '') {
      delete obj[propName];
    }
  }
}
