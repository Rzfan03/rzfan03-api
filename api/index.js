const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

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

app.use('/api/home', require('../src/routes/home'));
app.use('/api/anime', require('../src/routes/anime'));
app.use('/api/episode', require('../src/routes/episode'));
app.use('/api/genres', require('../src/routes/genres'));
app.use('/api/lk21', require('../src/routes/lk21'));
app.use('/api/manga', require('../src/routes/manga'));
app.use('/api/download', require('../src/routes/downloader'));
app.use('/api/tools', require('../src/routes/tools'));
app.use('/api/search', require('../src/routes/search'));
app.use('/api/jadwal', require('../src/routes/schedule'));

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
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint tidak ditemukan' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

module.exports = app;
