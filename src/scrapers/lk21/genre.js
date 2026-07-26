const { fetchHTML } = require('../../utils/fetcher');
const { loadCheerio } = require('../../utils/parser');
const { urls } = require('../../config');

async function scrapeGenre(genre, page = 1) {
  // LK21 is a JS SPA - genre pages don't have server-rendered content
  // Return available genres list instead
  const html = await fetchHTML('/', urls.lk21);
  const $ = loadCheerio(html);

  const genres = [];
  $('a[href*="/genre/"]').each((_, el) => {
    const name = $(el).text().trim();
    const href = $(el).attr('href') || '';
    const slug = href.split('/genre/')[1]?.replace(/\/$/, '') || '';
    if (name && slug && !genres.find(g => g.slug === slug)) {
      genres.push({ name, slug });
    }
  });

  return {
    genre,
    genres,
    movies: [],
    note: 'LK21 is a JS SPA. Use /api/lk21/search?q= to search for movies.',
  };
}

module.exports = { scrapeGenre };
