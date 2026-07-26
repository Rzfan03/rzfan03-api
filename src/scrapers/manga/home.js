const { fetchHTML } = require('../../utils/fetcher');
const { loadCheerio } = require('../../utils/parser');
const { urls } = require('../../config');

async function getMangaHome() {
  const html = await fetchHTML('/', urls.manga);
  const $ = loadCheerio(html);

  const popular = [];
  $('#Rekomendasi_Komik article.ls4').each((_, el) => {
    const $el = $(el);
    const title = $el.find('.ls4j h4 a').text().trim();
    const slug = $el.find('.ls4j h4 a').attr('href')?.replace(/^\/|\/$/g, '').split('/').pop() || '';
    const poster = $el.find('.ls4v img').attr('data-src') || $el.find('.ls4v img').attr('src') || '';
    const latestChapter = $el.find('a.ls24').text().trim();
    const rank = $el.find('span.rank-num').text().trim();
    if (title) {
      popular.push({ title, slug, poster, latestChapter, rank: parseInt(rank) || 0 });
    }
  });

  const latest = [];
  $('article.blb, div.bxl, div.listupd .bs').each((_, el) => {
    const $el = $(el);
    const title = $el.find('.tt h2, h2.title, h3').text().trim();
    const slug = ($el.find('a').attr('href') || '').replace(/^\/|\/$/g, '').split('/').pop();
    const poster = $el.find('img').attr('data-src') || $el.find('img').attr('src') || '';
    const latestChapter = $el.find('.epxs, .chapter, .new1 a').text().trim();
    if (title) {
      latest.push({ title, slug, poster, latestChapter });
    }
  });

  return { popular, latest };
}

module.exports = { getMangaHome };
