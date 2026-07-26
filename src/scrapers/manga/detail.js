const { fetchHTML } = require('../../utils/fetcher');
const { loadCheerio } = require('../../utils/parser');
const { urls } = require('../../config');

async function getMangaDetail(slug) {
  const html = await fetchHTML('/manga/' + slug + '/', urls.manga);
  const $ = loadCheerio(html);

  const title = $('span[itemprop="name"]').text().trim() || $('#Judul h1').text().trim() || '';
  const altTitle = $('span.j2').text().trim();
  const cover = $('img[itemprop="image"]').attr('src') || $('img[itemprop="image"]').attr('data-src') || '';
  const synopsis = $('p.desc[itemprop="description"]').text().trim();

  const info = {};
  $('table.inftable tr').each((_, el) => {
    const label = $(el).find('td:first-child').text().trim().toLowerCase().replace(/\s+/g, '_');
    const value = $(el).find('td:last-child').text().trim();
    if (label) info[label] = value;
  });

  const genres = [];
  $('table.inftable ul.genre a span').each((_, el) => {
    const g = $(el).text().trim();
    if (g) genres.push(g);
  });

  const chapters = [];
  $('table#Daftar_Chapter tr[itemprop="itemListElement"]').each((_, el) => {
    const $el = $(el);
    const chapterTitle = $el.find('td.judulseries a span[itemprop="name"]').text().trim();
    const chapterSlug = ($el.find('td.judulseries a').attr('href') || '').replace(/^\/|\/$/g, '').split('/').pop();
    const date = $el.find('td.tanggalseries').text().trim();
    if (chapterTitle) {
      chapters.push({ title: chapterTitle, slug: chapterSlug, date });
    }
  });

  return { title, altTitle, cover, synopsis, info, genres, chapters };
}

module.exports = { getMangaDetail };
