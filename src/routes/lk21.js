const express = require('express');
const router = express.Router();
const { scrapeHome } = require('../scrapers/lk21/home');
const { scrapeSearch } = require('../scrapers/lk21/search');
const { scrapeDetail } = require('../scrapers/lk21/detail');
const { scrapeGenre } = require('../scrapers/lk21/genre');
const { scrapeCountry } = require('../scrapers/lk21/country');
const { scrapeList } = require('../scrapers/lk21/list');

router.get('/home', async (req, res) => {
  try {
    const data = await scrapeHome();
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
    const data = await scrapeSearch(query);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/movie/:slug', async (req, res) => {
  try {
    const data = await scrapeDetail(req.params.slug);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/genre/:genre', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const data = await scrapeGenre(req.params.genre, page);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/country/:country', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const data = await scrapeCountry(req.params.country, page);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/list', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const data = await scrapeList(page);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
