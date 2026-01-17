export function detectLanguage(text) {
  const tamilRegex = /[\u0B80-\u0BFF]/;
  return tamilRegex.test(text) ? "ta-IN" : "en-IN";
}
