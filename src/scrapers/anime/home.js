const { fetchHTML } = require('../../utils/fetcher');
const { loadCheerio } = require('../../utils/parser');
const { urls } = require('../../config');

async function scrapeHome() {
  const html = await fetchHTML('/', urls.anime);
  const $ = loadCheerio(html);

  const latest = [];

  $('.listupd.normal article.bs').each((_, el) => {
    const $el = $(el);
    const $a = $el.find('.bsx a');
    const href = $a.attr('href') || '';
    const title = $el.find('.tt').contents().first().text().trim();
    const poster = $el.find('img.ts-post-image').attr('src') || '';
    const episode = $el.find('.epx').text().trim();
    const type = $el.find('.typez').text().trim();

    let slug = '';
    if (href.includes('/anime/')) {
      slug = href.split('/anime/')[1]?.replace(/\/$/, '') || '';
    } else {
      slug = href.replace(/^https?:\/\/[^/]+/, '').replace(/-episode-\d+.*$/, '').replace(/^\//, '');
    }

    if (title) {
      latest.push({ title, slug, poster, episode, type, url: href });
    }
  });

  return { latest };
}

module.exports = { scrapeHome };
