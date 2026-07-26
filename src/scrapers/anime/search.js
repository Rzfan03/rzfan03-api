const { fetchHTML } = require('../../utils/fetcher');
const { loadCheerio } = require('../../utils/parser');
const { urls } = require('../../config');

async function scrapeSearch(query) {
  const html = await fetchHTML(`/?s=${encodeURIComponent(query)}`, urls.anime);
  const $ = loadCheerio(html);

  if ($('center h3').text().trim().toLowerCase().includes('not found')) {
    return { query, results: [] };
  }

  const results = [];

  $('.listupd article.bs, .bixbox article.bs').each((_, el) => {
    const $el = $(el);
    const href = $el.find('.bsx a').attr('href') || '';
    const title = $el.find('.tt').contents().first().text().trim();
    const poster = $el.find('img.ts-post-image').attr('src') || '';
    const episode = $el.find('.epx').text().trim();
    const type = $el.find('.typez').text().trim();
    const status = $el.find('.status').text().trim();

    let slug = '';
    if (href.includes('/anime/')) {
      slug = href.split('/anime/')[1]?.replace(/\/$/, '') || '';
    } else {
      slug = href.replace(/^https?:\/\/[^/]+/, '').replace(/-episode-\d+.*$/, '').replace(/^\//, '');
    }

    if (title) {
      results.push({ title, slug, poster, episode, type, status, url: href });
    }
  });

  if (results.length === 0) {
    $('.serieslist li').each((_, el) => {
      const $el = $(el);
      const href = $el.find('.imgseries a').attr('href') || '';
      const title = $el.find('.leftseries h4 a').text().trim();
      const poster = $el.find('.imgseries img').attr('src') || '';

      const genres = [];
      $el.find('.leftseries span a[rel="tag"]').each((_, g) => {
        const name = $(g).text().trim();
        if (name) genres.push(name);
      });

      let slug = '';
      if (href.includes('/anime/')) {
        slug = href.split('/anime/')[1]?.replace(/\/$/, '') || '';
      } else {
        slug = href.replace(/^https?:\/\/[^/]+/, '').replace(/-episode-\d+.*$/, '').replace(/^\//, '');
      }

      if (title && slug) {
        results.push({ title, slug, poster, genres, url: href });
      }
    });
  }

  return { query, results };
}

module.exports = { scrapeSearch };
