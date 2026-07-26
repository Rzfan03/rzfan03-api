const axios = require('axios');
const { urls } = require('../../config');

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
];

async function scrapeSearch(query) {
  const { data } = await axios.get(
    `${urls.lk21}/ajax-search.php?q=${encodeURIComponent(query)}`,
    {
      headers: {
        'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
        'Referer': urls.lk21 + '/',
      },
      timeout: 15000,
      validateStatus: () => true,
    }
  );

  const items = Array.isArray(data) ? data : [];
  const movies = items.map((item) => {
    const url = item.url || '';
    const slugMatch = url.match(/\/([^/]+)\/?$/);
    const slug = slugMatch ? slugMatch[1] : '';

    return {
      title: item.title || '',
      slug,
      poster: item.poster || '',
      type: item.type || '',
      year: item.year || '',
      url,
    };
  });

  return { movies, query };
}

module.exports = { scrapeSearch };
