const express = require('express');
const router = express.Router();
const { scrapeHome } = require('../scrapers/anime/home');

router.get('/', async (req, res) => {
  try {
    const data = await scrapeHome();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
