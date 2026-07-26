const express = require('express');
const router = express.Router();
const { scrapeYouTube } = require('../scrapers/downloader/youtube');
const { scrapeTiktok } = require('../scrapers/downloader/tiktok');
const { scrapeInstagram } = require('../scrapers/downloader/instagram');
const { scrapeTwitter } = require('../scrapers/downloader/twitter');

router.get('/youtube', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ success: false, error: 'Query parameter "url" is required' });
    }
    const data = await scrapeYouTube(url);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/tiktok', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ success: false, error: 'Query parameter "url" is required' });
    }
    const data = await scrapeTiktok(url);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/instagram', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ success: false, error: 'Query parameter "url" is required' });
    }
    const data = await scrapeInstagram(url);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/twitter', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ success: false, error: 'Query parameter "url" is required' });
    }
    const data = await scrapeTwitter(url);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
