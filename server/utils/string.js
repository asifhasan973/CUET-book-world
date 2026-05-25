/**
 * Escapes characters that have special meaning in regular expressions
 * to prevent ReDoS and regex injections when query parameters are
 * passed directly to MongoDB's $regex.
 * 
 * @param {string} string - The raw input string to escape
 * @returns {string} The escaped string safe for RegExp
 */
const escapeRegex = (string = '') => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

module.exports = {
  escapeRegex,
};
