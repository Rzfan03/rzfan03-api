const express = require('express');
const router = express.Router();
const { getMangaHome } = require('../scrapers/manga/home');
const { searchManga } = require('../scrapers/manga/search');
const { getChapterImages } = require('../scrapers/manga/chapter');
const { getGenreList } = require('../scrapers/manga/genre');
const { getLibrary } = require('../scrapers/manga/library');
const { getMangaDetail } = require('../scrapers/manga/detail');

router.get('/home', async (req, res) => {
  try {
    const data = await getMangaHome();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query parameter "q" is required' });
    }
    const data = await searchManga(query);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/chapter/:slug', async (req, res) => {
  try {
    const data = await getChapterImages(req.params.slug);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/genres', async (req, res) => {
  try {
    const data = await getGenreList();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/genre/:genre', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const data = await getGenreList(req.params.genre, page);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/library', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const params = req.query;
    const data = await getLibrary(params, page);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const data = await getMangaDetail(req.params.slug);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
