const { fetchHTML } = require('../../utils/fetcher');
const { loadCheerio } = require('../../utils/parser');
const { urls } = require('../../config');

async function scrapeHome() {
  const html = await fetchHTML('/latest/', urls.lk21);
  const $ = loadCheerio(html);

  const movies = [];

  // LK21 official is a SPA - try multiple selector strategies
  // Strategy 1: Standard card links
  $('a[href*="/"]').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href') || '';
    const title = $el.find('h3, h4, h2').text().trim() || $el.attr('title') || '';
    const poster = $el.find('img').attr('src') || $el.find('img').attr('data-src') || '';

    if (title && href && !href.includes('/genre/') && !href.includes('/country/') && !href.includes('/year/') && !href.includes('/latest') && !href.includes('/populer') && !href.includes('/filter') && !href.includes('/series') && !href.includes('/assets') && !href.includes('/cdn-cgi')) {
      let slug = href.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '').replace(/^\//, '');
      if (slug && !movies.find(m => m.slug === slug)) {
        movies.push({ title, slug, poster, url: href });
      }
    }
  });

  // Strategy 2: Try movie detail page links (/{slug-year}/)
  if (movies.length === 0) {
    $('a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const match = href.match(/\/([a-z0-9-]+-\d{4})\/?$/i);
      if (match) {
        const slug = match[1];
        const title = $(el).text().trim() || $(el).attr('title') || slug;
        const poster = $(el).find('img').attr('src') || '';
        if (!movies.find(m => m.slug === slug)) {
          movies.push({ title, slug, poster, url: href });
        }
      }
    });
  }

  return { movies, note: 'LK21 is a JS SPA. For reliable results, use /api/lk21/search?q=' };
}

module.exports = { scrapeHome };
