const { fetchHTML } = require('../../utils/fetcher');
const { loadCheerio } = require('../../utils/parser');
const { urls } = require('../../config');

async function scrapeGenreList() {
  const html = await fetchHTML('/anime/', urls.anime);
  const $ = loadCheerio(html);

  const genres = [];
  $('.filters .dropdown-menu li').each((_, el) => {
    const $el = $(el);
    const input = $el.find('input[type="checkbox"]');
    const label = $el.find('label').text().trim();
    const value = input.attr('value') || '';
    if (label && value && input.attr('name')?.includes('genre')) {
      genres.push({ name: label, slug: value });
    }
  });

  return genres;
}

async function scrapeAnimeByGenre(genreSlug, page = 1) {
  const params = page > 1
    ? `?genre[]=${genreSlug}&page=${page}`
    : `?genre[]=${genreSlug}`;
  const html = await fetchHTML(`/anime/${params}`, urls.anime);
  const $ = loadCheerio(html);

  const animeList = [];
  $('.listupd article.bs').each((_, el) => {
    const $el = $(el);
    const href = $el.find('.bsx a').attr('href') || '';
    const title = $el.find('.tt').contents().first().text().trim();
    const poster = $el.find('img.ts-post-image').attr('src') || '';
    const episode = $el.find('.epx').text().trim();
    const type = $el.find('.typez').text().trim();
    const status = $el.find('.status').text().trim();
    const slug = href.split('/anime/')[1]?.replace(/\/$/, '') || '';

    if (title) {
      animeList.push({ title, slug, poster, episode, type, status, url: href });
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

  return { genre: genreSlug, animeList, currentPage: page, totalPages };
}

module.exports = { scrapeGenreList, scrapeAnimeByGenre };
