const { fetchHTML } = require('../../utils/fetcher');
const { loadCheerio } = require('../../utils/parser');
const { urls } = require('../../config');

async function scrapeDetail(slug) {
  const html = await fetchHTML('/' + slug, urls.lk21);
  const $ = loadCheerio(html);

  // Title from h1 (e.g. "Nonton Tiger's Trigger (2024) Sub Indo")
  const title = $('h1').first().text().trim()
    .replace(/^Nonton\s+/, '').replace(/\s+Sub\s+Indo$/, '').trim();

  // Poster
  const poster = $('[itemprop="image"]').attr('content') ||
    $('meta[property="og:image"]').attr('content') || '';

  // Synopsis from structured data
  const synopsis = $('[itemprop="description"]').text().trim() ||
    $('meta[property="og:description"]').attr('content') || '';

  // Year
  const year = $('[itemprop="datePublished"]').attr('content') || '';

  // Duration (PT85M → "85m")
  const durationRaw = $('[itemprop="duration"]').attr('content') || '';
  const durMatch = durationRaw.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  const duration = durMatch
    ? [durMatch[1] ? durMatch[1] + 'h' : '', durMatch[2] ? durMatch[2] + 'm' : ''].filter(Boolean).join(' ')
    : '';

  // Rating
  const rating = $('[itemprop="ratingValue"]').text().trim() || '';
  const bestRating = $('[itemprop="bestRating"]').text().trim() || '';
  const ratingCount = $('[itemprop="ratingCount"]').text().trim() || '';

  // Genres — from og:description (most reliable: "Genre: Action.  Rating: ...")
  const ogDesc = $('meta[property="og:description"]').attr('content') || '';
  const genreMatch = ogDesc.match(/Genre:\s*([^.]+)/i);
  const genres = genreMatch
    ? [...new Set(genreMatch[1].split(',').map(g => g.trim()).filter(Boolean))]
    : [];
  // Fallback: itemprop="genre"
  if (!genres.length) {
    $('[itemprop="genre"]').each((_, el) => {
      const name = $(el).text().trim();
      if (name && !genres.includes(name)) genres.push(name);
    });
  }

  // Actors
  const actors = [];
  $('[itemprop="actor"]').each((_, el) => {
    const actor = $(el).next('[itemprop="name"]').text().trim() || $(el).text().trim();
    if (actor && !actors.includes(actor)) actors.push(actor);
  });

  // Streaming servers
  const servers = [];
  $('button[onclick*="switchServer"]').each((_, el) => {
    const btn = $(el);
    const onclick = btn.attr('onclick') || '';
    const urlMatch = onclick.match(/switchServer\('([^']+)'/);
    servers.push({
      name: btn.text().trim(),
      url: urlMatch ? urlMatch[1] : '',
    });
  });

  // Download links
  const downloads = [];
  $('a[onclick*="download"], a[href*="download"]').each((_, el) => {
    const a = $(el);
    const label = a.text().trim();
    const href = a.attr('href') || a.attr('onclick') || '';
    if (label && href) downloads.push({ label, url: href });
  });

  return {
    title,
    slug,
    poster,
    synopsis,
    year,
    duration,
    rating: rating ? { score: rating, best: bestRating, count: ratingCount } : null,
    genres,
    actors,
    servers,
    downloads,
  };
}

module.exports = { scrapeDetail };
