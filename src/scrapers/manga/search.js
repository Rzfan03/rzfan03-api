const { fetchHTML } = require('../../utils/fetcher');
const { loadCheerio } = require('../../utils/parser');
const { urls } = require('../../config');

async function searchManga(query) {
  const path = '/?post_type=manga&s=' + encodeURIComponent(query);
  const html = await fetchHTML(path, urls.manga);
  const $ = loadCheerio(html);

  const results = [];
  $('div.bge').each((_, el) => {
    const $el = $(el);
    const title = $el.find('div.kan h3').text().trim();
    const link = $el.find('div.kan a').attr('href') || '';
    const slug = link.replace(/^\/|\/$/g, '').split('/').pop();
    const poster = $el.find('div.bgei img').attr('data-src') || $el.find('div.bgei img').attr('src') || '';
    const latestChapter = $el.find('div.kan div.new1 a').text().trim();
    if (title) {
      results.push({ title, slug, poster, latestChapter });
    }
  });

  return results;
}

module.exports = { searchManga };
