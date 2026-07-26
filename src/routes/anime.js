const express = require('express');
const router = express.Router();
const { scrapeOngoing } = require('../scrapers/anime/ongoing');
const { scrapeComplete } = require('../scrapers/anime/complete');
const { scrapeAnimeList } = require('../scrapers/anime/animeList');
const { scrapeDetail } = require('../scrapers/anime/detail');

router.get('/ongoing', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const data = await scrapeOngoing(page);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/complete', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const data = await scrapeComplete(page);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/list', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const data = await scrapeAnimeList(page);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const data = await scrapeDetail(req.params.slug);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
