const { fetchHTML } = require('../../utils/fetcher');
const { loadCheerio } = require('../../utils/parser');
const { urls } = require('../../config');

async function scrapeDetail(slug) {
  const html = await fetchHTML('/' + slug + '/', urls.lk21);
  const $ = loadCheerio(html);

  // Title from h1
  const title = $('h1').first().text().trim()
    .replace(/^Nonton\s+/, '').replace(/\s+Sub\s+Indo$/, '').trim();

  // Poster from meta or img
  const poster = $('meta[property="og:image"]').attr('content')
    || $('img[itemprop="image"]').attr('src')
    || $('img').first().attr('src') || '';

  // Synopsis from meta description
  const synopsis = $('meta[property="og:description"]').attr('content')
    || $('meta[name="description"]').attr('content') || '';

  // Try to extract info from page text
  const pageText = $.html();
  const yearMatch = pageText.match(/(\d{4})/);
  const year = yearMatch ? yearMatch[1] : '';

  // Genres from links
  const genres = [];
  $('a[href*="/genre/"]').each((_, el) => {
    const text = $(el).text().trim();
    if (text && !genres.includes(text)) genres.push(text);
  });

  // Streaming iframe
  const streamingUrl = $('iframe').attr('src') || $('iframe').attr('data-src') || '';

  // Download links
  const downloads = [];
  $('a[href*="download"], a[href*="dl"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const label = $(el).text().trim();
    if (href && label) downloads.push({ label, url: href });
  });

  return {
    title,
    slug,
    poster,
    synopsis,
    year,
    genres,
    streamingUrl,
    downloads,
    note: 'LK21 is a JS SPA. Streaming/download links may require browser rendering.',
  };
}

module.exports = { scrapeDetail };
