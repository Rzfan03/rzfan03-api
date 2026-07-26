process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason?.message || reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
});

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { port } = require('./config');

const app = express();

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Terlalu banyak request, coba lagi nanti.' },
});
app.use(limiter);

app.use('/api/home', require('./routes/home'));
app.use('/api/anime', require('./routes/anime'));
app.use('/api/episode', require('./routes/episode'));
app.use('/api/genres', require('./routes/genres'));
app.use('/api/lk21', require('./routes/lk21'));
app.use('/api/manga', require('./routes/manga'));
app.use('/api/download', require('./routes/downloader'));
app.use('/api/tools', require('./routes/tools'));
app.use('/api/search', require('./routes/search'));
app.use('/api/jadwal', require('./routes/schedule'));

app.get('/', (req, res) => {
  res.json({
    name: 'Rzfan03 API',
    author: 'rzfan03',
    version: '1.0.0',
    description: 'All-in-One REST API - Anime, Movies, Manga, Downloaders, Tools',
    credit: 'Data scraped from samehadaku.io, tv.lk21official.asia, komiku.org',
    categories: {
      anime: '/api/anime/*',
      lk21: '/api/lk21/*',
      manga: '/api/manga/*',
      downloader: '/api/download/*',
      tools: '/api/tools/*',
      search: '/api/search?q=',
    },
    endpoints: {
      'GET /api/home': 'Homepage - latest anime',
      'GET /api/anime/ongoing?page=1': 'Ongoing anime',
      'GET /api/anime/complete?page=1': 'Completed anime',
      'GET /api/anime/list?page=1': 'All anime A-Z',
      'GET /api/anime/:slug': 'Anime detail',
      'GET /api/episode/:slug': 'Episode streaming links',
      'GET /api/genres': 'All genres',
      'GET /api/genres/:genre?page=1': 'Anime by genre',
      'GET /api/lk21/home': 'Latest movies',
      'GET /api/lk21/search?q=': 'Search movies',
      'GET /api/lk21/movie/:slug': 'Movie detail',
      'GET /api/lk21/genre/:genre': 'Movies by genre',
      'GET /api/lk21/country/:country': 'Movies by country',
      'GET /api/lk21/list?page=1': 'All movies',
      'GET /api/manga/home': 'Manga homepage',
      'GET /api/manga/search?q=': 'Search manga',
      'GET /api/manga/:slug': 'Manga detail',
      'GET /api/manga/chapter/:slug': 'Chapter images',
      'GET /api/manga/genres': 'Manga genres',
      'GET /api/manga/genre/:genre': 'Manga by genre',
      'GET /api/manga/library': 'Manga library (filtered)',
      'GET /api/download/youtube?url=': 'YouTube download',
      'GET /api/download/tiktok?url=': 'TikTok download',
      'GET /api/download/instagram?url=': 'Instagram download',
      'GET /api/download/twitter?url=': 'Twitter download',
      'POST /api/tools/qrcode': 'QR code generator',
      'POST /api/tools/base64/encode': 'Base64 encode',
      'POST /api/tools/base64/decode': 'Base64 decode',
      'GET /api/tools/ip/:ip': 'IP lookup',
      'GET /api/tools/currency': 'Currency converter',
      'POST /api/tools/shorturl': 'URL shortener',
      'GET /api/search?q=': 'Unified search',
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint tidak ditemukan' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Rzfan03 API running on http://localhost:${port}`);
});
