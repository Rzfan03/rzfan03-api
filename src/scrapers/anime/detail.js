const { fetchHTML } = require('../../utils/fetcher');
const { loadCheerio } = require('../../utils/parser');
const { urls } = require('../../config');

async function scrapeDetail(slug) {
  const html = await fetchHTML(`/anime/${slug}/`, urls.anime);
  const $ = loadCheerio(html);

  const title = $('.infox h1.entry-title').text().trim();
  const poster = $('.thumbook .thumb img').attr('src') || '';
  const synopsis = $('.bixbox.synp .entry-content').text().trim();

  const details = {};
  $('.infox .spe span').each((_, el) => {
    const text = $(el).text().trim();
    const parts = text.split(':');
    if (parts.length >= 2) {
      const label = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
      if (label && value) {
        details[label] = value;
      }
    }
  });

  const genres = [];
  $('.infox .genxed a').each((_, el) => {
    const genre = $(el).text().trim();
    const href = $(el).attr('href') || '';
    const genreSlug = href.split('/genres/')[1]?.replace(/\/$/, '') || '';
    if (genre) genres.push({ name: genre, slug: genreSlug });
  });

  const episodes = [];
  $('.eplister ul li').each((_, el) => {
    const $el = $(el);
    const link = $el.find('a').attr('href') || '';
    const epNum = $el.find('.epl-num').text().trim();
    const epTitle = $el.find('.epl-title').text().trim();
    const date = $el.find('.epl-date').text().trim();
    const epSlug = link.replace(/^https?:\/\/[^/]+\/?/, '').replace(/\/$/, '');

    episodes.push({ episode: parseInt(epNum) || 0, title: epTitle, slug: epSlug, date, url: link });
  });

  return {
    title,
    poster,
    synopsis,
    genres,
    details,
    episodes,
  };
}

module.exports = { scrapeDetail };
