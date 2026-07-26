const { fetchHTML } = require('../../utils/fetcher');
const { loadCheerio } = require('../../utils/parser');
const { urls } = require('../../config');

async function scrapeEpisode(slug) {
  const html = await fetchHTML(`/${slug}/`, urls.anime);
  const $ = loadCheerio(html);

  const title = $('h1.entry-title').text().trim();

  const prevLink = $('.naveps .nvs a[rel="prev"]').attr('href') || '';
  const nextLink = $('.naveps .nvs a[rel="next"]').attr('href') || '';
  const allEpisodesLink = $('.naveps .nvsc a').attr('href') || '';

  const prevEpisode = prevLink ? prevLink.replace(/^https?:\/\/[^/]+\/?/, '').replace(/\/$/, '') : null;
  const nextEpisode = nextLink ? nextLink.replace(/^https?:\/\/[^/]+\/?/, '').replace(/\/$/, '') : null;

  const streaming = [];
  $('select.mirror option').each((_, el) => {
    const val = $(el).attr('value') || '';
    if (val) {
      try {
        const decoded = Buffer.from(val, 'base64').toString('utf-8');
        const srcMatch = decoded.match(/src="([^"]+)"/i);
        if (srcMatch && srcMatch[1]) {
          streaming.push(srcMatch[1]);
        }
      } catch (e) {
        // Not base64, skip
      }
    }
  });

  if (streaming.length === 0) {
    $('iframe').each((_, el) => {
      const src = $(el).attr('src') || '';
      if (src && !src.includes('about:blank')) {
        streaming.push(src);
      }
    });
  }

  const relatedEpisodes = [];
  $('#sidebar .episodelist ul li').each((_, el) => {
    const $el = $(el);
    const link = $el.find('a').attr('href') || '';
    const epTitle = $el.find('.playinfo h3').text().trim();
    const date = $el.find('.playinfo span').text().trim();
    const epSlug = link.replace(/^https?:\/\/[^/]+\/?/, '').replace(/\/$/, '');

    relatedEpisodes.push({ title: epTitle, slug: epSlug, date, url: link });
  });

  const info = {};
  $('.single-info .spe span').each((_, el) => {
    const text = $(el).text().trim();
    const parts = text.split(':');
    if (parts.length >= 2) {
      const label = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
      if (label && value) {
        info[label] = value;
      }
    }
  });

  const genres = [];
  $('.single-info .genxed a').each((_, el) => {
    const genre = $(el).text().trim();
    if (genre) genres.push(genre);
  });

  return {
    title,
    slug,
    prevEpisode,
    nextEpisode,
    allEpisodes: allEpisodesLink ? allEpisodesLink.replace(/^https?:\/\/[^/]+\/?/, '').replace(/\/$/, '') : null,
    streaming,
    relatedEpisodes,
    info,
    genres,
  };
}

module.exports = { scrapeEpisode };
