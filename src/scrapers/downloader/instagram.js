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

async function scrapeSssInstagram(instagramUrl) {
  const { data: pageHtml } = await axios.get('https://sssinstagram.com/', {
    headers: {
      'User-Agent': getRandomUA(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    timeout: 15000,
  });

  const $ = loadCheerio(pageHtml);

  const tokenEl = $('input[name="_token"]').val()
    || pageHtml.match(/name="_token"\s+value="([^"]+)"/)?.[1]
    || pageHtml.match(/csrf[_-]token.*?['"]([a-zA-Z0-9]+)['"]/)?.[1];

  if (!tokenEl) throw new Error('Could not extract SSSInstagram CSRF token');

  const { data: result } = await axios.post(
    'https://sssinstagram.com/r',
    { id: instagramUrl, _token: tokenEl },
    {
      headers: {
        'User-Agent': getRandomUA(),
        'Content-Type': 'application/json',
        'Referer': 'https://sssinstagram.com/',
        'Origin': 'https://sssinstagram.com',
        'X-Requested-With': 'XMLHttpRequest',
      },
      timeout: 15000,
    }
  );

  if (result && result.success !== false) {
    const items = Array.isArray(result) ? result : result.data ? (Array.isArray(result.data) ? result.data : [result.data]) : [];

    const media = items.map(item => ({
      title: item.title || item.description || 'Instagram Post',
      author: item.author || item.username || '',
      mediaUrl: item.url || item.download_url || item.video_url || item.image_url || '',
      type: item.type || (item.video_url ? 'video' : 'image'),
    })).filter(m => m.mediaUrl);

    if (media.length > 0) {
      return media.length === 1 ? media[0] : { media };
    }
  }

  throw new Error('SSSInstagram returned no download links');
}

async function scrapeSnapinsta(instagramUrl) {
  const { data: pageHtml } = await axios.get('https://snapinsta.to/', {
    headers: {
      'User-Agent': getRandomUA(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    timeout: 15000,
  });

  const $ = loadCheerio(pageHtml);

  const tokenEl = $('input[name="_token"]').val()
    || pageHtml.match(/name="_token"\s+value="([^"]+)"/)?.[1];

  const urlEl = $('input[name="url"]').val() || instagramUrl;

  const postData = new URLSearchParams();
  postData.append('url', urlEl);
  if (tokenEl) postData.append('_token', tokenEl);

  const { data: result } = await axios.post('https://snapinsta.to/api/download', postData, {
    headers: {
      'User-Agent': getRandomUA(),
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': 'https://snapinsta.to/',
      'Origin': 'https://snapinsta.to',
    },
    timeout: 15000,
  });

  if (result && result.success !== false) {
    const html = result.data?.html || result.html || '';
    if (html) {
      const $r = loadCheerio(html);
      const mediaUrl = $r('a[href*="download"]').attr('href')
        || $r('a.btn').attr('href')
        || $r('video source').attr('src')
        || $r('img').attr('src')
        || '';

      if (mediaUrl) {
        return {
          title: 'Instagram Media',
          author: '',
          mediaUrl,
          type: html.includes('<video') ? 'video' : 'image',
        };
      }
    }

    if (result.url) {
      return {
        title: 'Instagram Media',
        author: '',
        mediaUrl: result.url,
        type: result.type || 'image',
      };
    }
  }

  throw new Error('Snapinsta returned no download links');
}

async function scrapeInstagram(instagramUrl) {
  try {
    return await scrapeSssInstagram(instagramUrl);
  } catch (primaryErr) {
    try {
      return await scrapeSnapinsta(instagramUrl);
    } catch (fallbackErr) {
      return {
        title: null,
        author: null,
        mediaUrl: null,
        type: null,
        error: `Scraping failed: ${primaryErr.message}. Alternative also failed: ${fallbackErr.message}. Instagram downloaders use Cloudflare protection and dynamic JS rendering that cannot be reliably bypassed server-side.`,
      };
    }
  }
}

module.exports = { scrapeInstagram };
