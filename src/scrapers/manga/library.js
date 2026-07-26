const { fetchHTML } = require('../../utils/fetcher');
const { loadCheerio } = require('../../utils/parser');
const { urls } = require('../../config');

function buildQueryString(params = {}) {
  const parts = [];
  if (params.orderby) parts.push('orderby=' + encodeURIComponent(params.orderby));
  if (params.tipe) parts.push('tipe=' + encodeURIComponent(params.tipe));
  if (params.genre) parts.push('genre=' + encodeURIComponent(params.genre));
  if (params.genre2) parts.push('genre2=' + encodeURIComponent(params.genre2));
  if (params.status) parts.push('status=' + encodeURIComponent(params.status));
  return parts.length ? '?' + parts.join('&') : '';
}

async function getLibrary(params = {}, page = 1) {
  const qs = buildQueryString(params);
  const pagePath = page > 1 ? '/page/' + page + '/' : '/';
  const path = '/pustaka' + pagePath + qs;
  const html = await fetchHTML(path, urls.manga);
  const $ = loadCheerio(html);

  const manga = [];
  $('div.bge').each((_, el) => {
    const $el = $(el);
    const title = $el.find('div.kan h3').text().trim();
    const link = $el.find('div.kan a').attr('href') || '';
    const slug = link.replace(/^\/|\/$/g, '').split('/').pop();
    const poster = $el.find('div.bgei img').attr('data-src') || $el.find('div.bgei img').attr('src') || '';
    const latestChapter = $el.find('div.kan div.new1 a').text().trim();
    if (title) {
      manga.push({ title, slug, poster, latestChapter });
    }
  });

  const hasNext = $('a.hpage.next, a.next').length > 0;

  return { manga, page, hasNext };
}

module.exports = { getLibrary, buildQueryString };
