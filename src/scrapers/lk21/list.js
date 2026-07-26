const { urls } = require('../../config');

async function scrapeList(page = 1) {
  return {
    movies: [],
    currentPage: page,
    totalPages: 1,
    note: 'LK21 is a JS SPA. Use /api/lk21/search?q= to search for movies.',
  };
}

module.exports = { scrapeList };
