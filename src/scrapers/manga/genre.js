const { fetchHTML } = require('../../utils/fetcher');
const { loadCheerio } = require('../../utils/parser');
const { urls } = require('../../config');

async function getGenreList(genre) {
  if (!genre) {
    // Return all available genres from komiku sidebar
    const html = await fetchHTML('/', urls.manga);
    const $ = loadCheerio(html);

    const genres = [];
    $('div.ntah.genr ul.genre li a, .sidebar ul.genre li a, a[href*="/genre/"]').each((_, el) => {
      const name = $(el).text().trim();
      const href = $(el).attr('href') || '';
      const slug = href.replace(/^https?:\/\/[^/]+\/genre\//, '').replace(/\/$/, '');
      if (name && slug && !genres.find(g => g.slug === slug)) {
        genres.push({ name, slug });
      }
    });

    return { genres };
  }

  // Fetch manga by genre - try both direct page and htmx API
  let html;
  try {
    html = await fetchHTML('/genre/' + genre + '/', urls.manga);
  } catch (e) {
    html = await fetchHTML('/genre/' + genre + '/', 'https://api.komiku.org');
  }
  const $ = loadCheerio(html);

  const manga = [];
  $('div.bge, article.blb, article.ls4').each((_, el) => {
    const $el = $(el);
    const title = $el.find('div.kan h3, h2.title, h3, h4 a').first().text().trim();
    const link = $el.find('div.kan a, a[href*="/manga/"]').first().attr('href') || '';
    const slug = link.replace(/^https?:\/\/[^/]+/, '').replace(/^\/|\/$/g, '').split('/').pop();
    const poster = $el.find('img').attr('data-src') || $el.find('img').attr('src') || '';
    const latestChapter = $el.find('div.kan div.new1 a, a.ls24, .chapter, .epxs').first().text().trim();
    if (title) {
      manga.push({ title, slug, poster, latestChapter });
    }
  });

  const genres = [];
  $('div.ntah.genr ul.genre li a, a[href*="/genre/"]').each((_, el) => {
    const name = $(el).text().trim();
    const href = $(el).attr('href') || '';
    const slug = href.replace(/^https?:\/\/[^/]+\/genre\//, '').replace(/\/$/, '');
    if (name && slug && !genres.find(g => g.slug === slug)) {
      genres.push({ name, slug });
    }
  });

  return { genre, manga, genres };
}

module.exports = { getGenreList };
