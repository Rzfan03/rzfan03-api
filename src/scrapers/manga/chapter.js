const { fetchHTML } = require('../../utils/fetcher');
const { loadCheerio } = require('../../utils/parser');
const { urls } = require('../../config');

async function getChapterImages(slug) {
  const html = await fetchHTML('/' + slug + '/', urls.manga);
  const $ = loadCheerio(html);

  const title = $('div#Judul > header > h1').text().trim();

  const images = [];
  $('div#Baca_Komik img.klazy').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    if (src) images.push(src);
  });

  const nav = [];
  $('.toolbar a.btn').each((_, el) => {
    const href = $(el).attr('href') || '';
    const label = $(el).text().trim();
    if (href) nav.push({ label, url: href });
  });

  let chapterData = null;
  const match = html.match(/var chapterData\s*=\s*(\{[\s\S]*?\});/);
  if (match) {
    try {
      chapterData = JSON.parse(match[1]);
    } catch {
      chapterData = null;
    }
  }

  return { title, images, nav, chapterData };
}

module.exports = { getChapterImages };
