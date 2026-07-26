const { urls } = require('../../config');
const { fetchHTML } = require('../../utils/fetcher');
const { loadCheerio } = require('../../utils/parser');

async function scrapeHome() {
  const html = await fetchHTML('/', urls.lk21);
  const $ = loadCheerio(html);

  const movies = [];
  $('a[aria-label*="LK21"]').each((_, el) => {
    const a = $(el);
    const href = a.attr('href') || '';
    const title = a.attr('title') || '';
    const poster = a.find('img').attr('src') || '';
    const text = a.find('p, span, h3').first().text().trim();
    const slugMatch = href.match(/\/([^/]+)$/);
    const slug = slugMatch ? slugMatch[1] : '';
    const yearMatch = text.match(/\((\d{4})\)/);
    const year = yearMatch ? yearMatch[1] : '';

    movies.push({
      title: text || title.replace('LK21 Nonton film ', ''),
      slug,
      poster,
      year,
      url: href,
    });
  });

  return { movies };
}

module.exports = { scrapeHome };
