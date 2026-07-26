const express = require('express');
const router = express.Router();
const { scrapeSchedule } = require('../scrapers/anime/schedule');

router.get('/', async (req, res) => {
  try {
    const data = await scrapeSchedule();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
