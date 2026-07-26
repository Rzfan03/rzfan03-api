const { fetchHTML } = require('../../utils/fetcher');
const { loadCheerio } = require('../../utils/parser');
const { urls } = require('../../config');

async function scrapeComplete(page = 1) {
  const params = page > 1 ? `?status=&type=&order=update&page=${page}` : '?status=&type=&order=update';
  const html = await fetchHTML(`/anime/${params}`, urls.anime);
  const $ = loadCheerio(html);

  const animeList = [];
  $('.listupd article.bs').each((_, el) => {
    const $el = $(el);
    const statusEl = $el.find('.status');
    const statusText = statusEl.text().trim();

    if (statusText !== 'Completed') return;

    const href = $el.find('.bsx a').attr('href') || '';
    const title = $el.find('.tt').contents().first().text().trim();
    const poster = $el.find('img.ts-post-image').attr('src') || '';
    const episode = $el.find('.epx').text().trim();
    const type = $el.find('.typez').text().trim();
    const slug = href.split('/anime/')[1]?.replace(/\/$/, '') || '';

    if (title) {
      animeList.push({ title, slug, poster, episode, type, status: 'Completed', url: href });
    }
  });

  const pages = [];
  $('.pagination .page-numbers').each((_, el) => {
    const text = $(el).text().trim();
    const pageNum = parseInt(text);
    if (!isNaN(pageNum)) {
      pages.push(pageNum);
    }
  });

  const totalPages = pages.length > 0 ? Math.max(...pages) : 1;

  return { animeList, currentPage: page, totalPages };
}

module.exports = { scrapeComplete };
