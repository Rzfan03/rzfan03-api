const { urls } = require('../../config');
const { fetchHTML } = require('../../utils/fetcher');
const { loadCheerio } = require('../../utils/parser');

async function scrapeCountry(country, page = 1) {
  const path = page > 1 ? `/country/${country}/page/${page}` : `/country/${country}`;
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

  return { country, movies, currentPage: page, totalPages: parseInt(totalPages) || 1 };
}

module.exports = { scrapeCountry };
