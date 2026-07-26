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

async function scrapeSnaptik(tiktokUrl) {
  const { data: pageHtml } = await axios.get('https://snaptik.app/en2', {
    headers: {
      'User-Agent': getRandomUA(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    timeout: 15000,
  });

  const $ = loadCheerio(pageHtml);

  const tokenMatch = pageHtml.match(/name="token"\s+value="([^"]+)"/);
  const token = tokenMatch ? tokenMatch[1] : null;

  const dtMatch = pageHtml.match(/var\s+dt\s*=\s*["']([^"']+)["']/);
  const dt = dtMatch ? dtMatch[1] : null;

  if (!token) {
    throw new Error('Could not extract Snaptik token');
  }

  const postData = new URLSearchParams();
  postData.append('token', token);
  if (dt) postData.append('dt', dt);
  postData.append('url', tiktokUrl);

  const { data: result } = await axios.post('https://snaptik.app/api/ajaxSearch', postData, {
    headers: {
      'User-Agent': getRandomUA(),
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': 'https://snaptik.app/en2',
      'Origin': 'https://snaptik.app',
      'HX-Request': 'true',
      'HX-Target': 'video-download',
    },
    timeout: 15000,
  });

  if (result && result.status === 'ok' && result.data) {
    const html = result.data.html || '';
    const $r = loadCheerio(html);

    const videoUrl = $r('a[href*="tiktok"]').attr('href')
      || $r('.download-link').attr('href')
      || $r('a.button').attr('href')
      || '';

    const thumbnail = $r('img').attr('src') || '';
    const title = $r('.video-title').text().trim()
      || $('title').text().trim()
      || 'TikTok Video';

    const photos = [];
    $r('img[src*="tiktok"]').each((_, el) => {
      const src = $r(el).attr('src');
      if (src && !src.includes('avatar') && !src.includes('icon')) photos.push(src);
    });

    if (videoUrl) {
      return {
        title,
        author: result.data.author || '',
        thumbnail,
        videoUrl,
        ...(photos.length > 0 ? { photos } : {}),
      };
    }
  }

  throw new Error('Snaptik returned no download links');
}

async function scrapeSavett(tiktokUrl) {
  const { data: html } = await axios.get('https://savett.to/', {
    headers: {
      'User-Agent': getRandomUA(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    timeout: 15000,
  });

  const $ = loadCheerio(html);

  const tokenEl = $('input[name="_token"]').val()
    || html.match(/name="_token"\s+value="([^"]+)"/)?.[1];

  if (!tokenEl) throw new Error('Could not extract Savett token');

  const { data: result } = await axios.post(
    'https://savett.to/api/download',
    { url: tiktokUrl, _token: tokenEl },
    {
      headers: {
        'User-Agent': getRandomUA(),
        'Content-Type': 'application/json',
        'Referer': 'https://savett.to/',
        'X-Requested-With': 'XMLHttpRequest',
      },
      timeout: 15000,
    }
  );

  if (result && result.success && result.data) {
    return {
      title: result.data.title || 'TikTok Video',
      author: result.data.author || '',
      thumbnail: result.data.thumbnail || '',
      videoUrl: result.data.url || result.data.video_url || '',
    };
  }

  throw new Error('Savett returned no download links');
}

async function scrapeTiktok(tiktokUrl) {
  try {
    return await scrapeSnaptik(tiktokUrl);
  } catch (primaryErr) {
    try {
      return await scrapeSavett(tiktokUrl);
    } catch (fallbackErr) {
      return {
        title: null,
        author: null,
        thumbnail: null,
        videoUrl: null,
        error: `Scraping failed: ${primaryErr.message}. Alternative also failed: ${fallbackErr.message}. TikTok downloaders use Cloudflare protection and dynamic JS rendering that cannot be reliably bypassed server-side.`,
      };
    }
  }
}

module.exports = { scrapeTiktok };
