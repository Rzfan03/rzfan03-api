const cheerio = require('cheerio');

function loadCheerio(html) {
  return cheerio.load(html);
}

function extractText($, selector) {
  return $(selector).text().trim();
}

function extractAttr($, selector, attr) {
  return $(selector).attr(attr) || '';
}

function cleanText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

module.exports = { loadCheerio, extractText, extractAttr, cleanText };
