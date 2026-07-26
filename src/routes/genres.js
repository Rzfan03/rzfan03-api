const express = require('express');
const router = express.Router();
const { scrapeGenreList, scrapeAnimeByGenre } = require('../scrapers/anime/genre');

router.get('/', async (req, res) => {
  try {
    const data = await scrapeGenreList();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:genre', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const data = await scrapeAnimeByGenre(req.params.genre, page);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
