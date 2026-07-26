const { fetchHTML } = require('../../utils/fetcher');
const { loadCheerio } = require('../../utils/parser');

async function searchManga(query) {
  // Komiku uses htmx — search results come from api.komiku.org
  const html = await fetchHTML('/?post_type=manga&s=' + encodeURIComponent(query), 'https://api.komiku.org');
  const $ = loadCheerio(html);

  const results = [];
  $('div.bge').each((_, el) => {
    const $el = $(el);
    const title = $el.find('h3').text().trim();
    const link = $el.find('div.bgei a').attr('href') || $el.find('a').attr('href') || '';
    const slug = link.replace(/^\/|\/$/g, '').split('/').pop();
    const poster = $el.find('img').attr('data-src') || $el.find('img').attr('src') || '';

    // Extract chapters — "Awal: Chapter X" and "Terbaru: Chapter Y"
    const chapterText = $el.find('.new1').text().trim() || $el.find('div.kan').text().trim();
    const latestMatch = chapterText.match(/Terbaru:\s*(Chapter\s*[\d.]+)/i);
    const firstMatch = chapterText.match(/Awal:\s*(Chapter\s*[\d.]+)/i);
    const latestChapter = latestMatch ? latestMatch[1].trim() : '';
    const firstChapter = firstMatch ? firstMatch[1].trim() : '';

    if (title) {
      results.push({ title, slug, poster, latestChapter, firstChapter });
    }
  });

  return { results, query };
}

module.exports = { searchManga };
