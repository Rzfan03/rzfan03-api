const { urls } = require('../../config');
const { fetchHTML } = require('../../utils/fetcher');
const { loadCheerio } = require('../../utils/parser');

async function scrapeGenre(genre, page = 1) {
  const path = page > 1 ? `/genre/${genre}/page/${page}` : `/genre/${genre}`;
  const html = await fetchHTML(path, urls.lk21);
  const $ = loadCheerio(html);

  const movies = [];
  $('a[aria-label*="LK21"]').each((_, el) => {
    const a = $(el);
    const href = a.attr('href') || '';
    const text = a.find('p, span, h3').first().text().trim();
    const poster = a.find('img').attr('src') || '';
    const slugMatch = href.match(/\/([^/]+)\/?$/);
    const slug = slugMatch ? slugMatch[1] : '';
    const yearMatch = text.match(/\((\d{4})\)/);
    const year = yearMatch ? yearMatch[1] : '';

    movies.push({ title: text, slug, poster, year, url: href });
  });

  const totalPages = $('a.page-numbers').last().text().trim() || '1';

  return { genre, movies, currentPage: page, totalPages: parseInt(totalPages) || 1 };
}

async function scrapeGenreList() {
  const html = await fetchHTML('/', urls.lk21);
  const $ = loadCheerio(html);

  const genres = [];
  $('a[href*="/genre/"]').each((_, el) => {
    const name = $(el).text().trim();
    const href = $(el).attr('href') || '';
    const slug = href.split('/genre/')[1]?.replace(/\/$/, '') || '';
    if (name && slug && name !== 'Lihat Semua' && !genres.find(g => g.slug === slug)) {
      genres.push({ name, slug });
    }
  });

  return { genres };
}

module.exports = { scrapeGenre, scrapeGenreList };
