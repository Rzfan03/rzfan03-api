const { urls } = require('../../config');
const { fetchHTML } = require('../../utils/fetcher');
const { loadCheerio } = require('../../utils/parser');

async function scrapeCountry(country, page = 1) {
  return {
    country,
    movies: [],
    note: 'LK21 is a JS SPA. Use /api/lk21/search?q= to search for movies.',
  };
}

module.exports = { scrapeCountry };
