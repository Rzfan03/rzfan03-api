const axios = require('axios');
const { fetchHTML } = require('../../utils/fetcher');
const { loadCheerio } = require('../../utils/parser');

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
];

function getRandomUA() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

async function scrapeY2mate(url) {
  const html = await fetchHTML('https://y2mate.casa/');
  const $ = loadCheerio(html);

  const scripts = [];
  $('script').each((_, el) => {
    const text = $(el).html() || '';
    if (text.includes('api') || text.includes('convert') || text.includes('download')) {
      scripts.push(text);
    }
  });

  const apiMatch = html.match(/(?:fetch|axios|ajax)\s*\(\s*['"`](\/api[^'"`]+)['"`]/);
  const tokenMatch = html.match(/token\s*[:=]\s*['"`]([^'"`]+)['"`]/);

  if (apiMatch) {
    try {
      const { data } = await axios.post(
        `https://y2mate.casa${apiMatch[1]}`,
        { url },
        {
          headers: {
            'User-Agent': getRandomUA(),
            'Content-Type': 'application/json',
            'Referer': 'https://y2mate.casa/',
            'Origin': 'https://y2mate.casa',
          },
          timeout: 15000,
        }
      );
      if (data && data.formats) {
        return {
          title: data.title || 'YouTube Video',
          thumbnail: data.thumbnail || '',
          durations: data.duration || '',
          formats: data.formats.map(f => ({
            quality: f.quality || f.label || 'Unknown',
            size: f.size || 'Unknown',
            url: f.url || f.download_url || '',
          })),
        };
      }
    } catch {
      // continue to fallback
    }
  }

  const dlLinks = [];
  $('a[href*="googlevideo"], a[href*="videoplayback"], a[href*=".mp4"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) dlLinks.push(href);
  });

  if (dlLinks.length > 0) {
    return {
      title: $('title').text().trim() || 'YouTube Video',
      thumbnail: $('meta[property="og:image"]').attr('content') || '',
      durations: '',
      formats: dlLinks.map((url, i) => ({
        quality: `Quality ${i + 1}`,
        size: 'Unknown',
        url,
      })),
    };
  }

  throw new Error('Could not extract download links from y2mate.casa');
}

async function scrapeYouTube(videoUrl) {
  try {
    return await scrapeY2mate(videoUrl);
  } catch (primaryErr) {
    try {
      const html = await fetchHTML(`https://www.y2mate.com/mates/analyzeV2/ajax`, 'https://www.y2mate.com');
      throw new Error('Alternative source unavailable');
    } catch {
      return {
        title: null,
        thumbnail: null,
        durations: null,
        formats: [],
        error: `Scraping failed: ${primaryErr.message}. Most YouTube downloaders use heavy JS rendering and Cloudflare protection which cannot be bypassed server-side. Consider using a YouTube Data API or yt-dlp for reliable downloads.`,
      };
    }
  }
}

module.exports = { scrapeYouTube };
