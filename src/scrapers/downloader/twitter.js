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

async function scrapeTwitterDownload(tweetUrl) {
  const { data: pageHtml } = await axios.get('https://twittervideodownloader.com/', {
    headers: {
      'User-Agent': getRandomUA(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    timeout: 15000,
  });

  const $ = loadCheerio(pageHtml);

  const csrfToken = $('input[name="csrf_token"]').val()
    || pageHtml.match(/csrf_token.*?['"]([a-zA-Z0-9_-]+)['"]/)?.[1]
    || pageHtml.match(/name="_token"\s+value="([^"]+)"/)?.[1];

  const gqlToken = pageHtml.match(/gql_token.*?['"]([^'"]+)['"]/)?.[1]
    || pageHtml.match(/Bearer\s+([A-Za-z0-9%-._~+/]+=*)/)?.[1]
    || '';

  if (!csrfToken) {
    throw new Error('Could not extract CSRF token from TwitterVideoDownloader');
  }

  const formData = new URLSearchParams();
  formData.append('url', tweetUrl);
  formData.append('csrf_token', csrfToken);
  if (gqlToken) formData.append('gql_token', gqlToken);

  const { data: result } = await axios.post('https://twittervideodownloader.com/download', formData, {
    headers: {
      'User-Agent': getRandomUA(),
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': 'https://twittervideodownloader.com/',
      'Origin': 'https://twittervideodownloader.com',
      'Cookie': pageHtml.match(/Set-Cookie:\s*([^;]+)/)?.[1] || '',
    },
    timeout: 15000,
  });

  if (result) {
    const html = typeof result === 'string' ? result : result.html || '';
    if (html) {
      const $r = loadCheerio(html);

      const mediaUrls = [];
      $r('a[href*="video"], a[href*="pbs.twimg.com"], img[src*="pbs.twimg.com"]').each((_, el) => {
        const href = $r(el).attr('href') || $r(el).attr('src');
        if (href && !mediaUrls.includes(href)) mediaUrls.push(href);
      });

      $r('video source, video').each((_, el) => {
        const src = $r(el).attr('src');
        if (src && !mediaUrls.includes(src)) mediaUrls.push(src);
      });

      if (mediaUrls.length > 0) {
        return {
          title: $r('.card-title').text().trim() || 'Twitter Media',
          author: $r('.username').text().trim() || '',
          mediaUrls,
        };
      }
    }

    if (result.downloads) {
      const downloads = Array.isArray(result.downloads) ? result.downloads : [result.downloads];
      const mediaUrls = downloads.map(d => d.url || d.download_url || d).filter(Boolean);
      if (mediaUrls.length > 0) {
        return {
          title: result.title || 'Twitter Media',
          author: result.author || '',
          mediaUrls,
        };
      }
    }
  }

  throw new Error('TwitterVideoDownloader returned no download links');
}

async function scrapeTwitter(tweetUrl) {
  try {
    return await scrapeTwitterDownload(tweetUrl);
  } catch (primaryErr) {
    try {
      const { data } = await axios.get(`https://api.vxtwitter.com/${tweetUrl.replace('https://', '').replace('http://', '')}`, {
        headers: { 'User-Agent': getRandomUA() },
        timeout: 10000,
      });

      if (data && data.tweet) {
        const mediaUrls = [];
        if (data.tweet.mediaDetails) {
          data.tweet.mediaDetails.forEach(m => {
            if (m.video_info?.variants) {
              const best = m.video_info.variants.filter(v => v.content_type === 'video/mp4').sort((a, b) => b.bitrate - a.bitrate)[0];
              if (best) mediaUrls.push(best.url);
            } else if (m.media_url_https) {
              mediaUrls.push(m.media_url_https);
            }
          });
        }

        if (mediaUrls.length > 0) {
          return {
            title: data.tweet.text || 'Twitter Media',
            author: data.tweet.user?.screen_name || '',
            mediaUrls,
          };
        }
      }

      throw new Error('VxTwitter returned no media');
    } catch (fallbackErr) {
      return {
        title: null,
        author: null,
        mediaUrls: [],
        error: `Scraping failed: ${primaryErr.message}. Alternative also failed: ${fallbackErr.message}. Twitter/X downloaders use Cloudflare protection and API restrictions that cannot be reliably bypassed server-side.`,
      };
    }
  }
}

module.exports = { scrapeTwitter };
