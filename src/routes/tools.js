const express = require('express');
const router = express.Router();
const { generateQR } = require('../tools/qrcode');
const { encodeBase64, decodeBase64 } = require('../tools/base64');
const { lookupIP } = require('../tools/iplookup');
const { convertCurrency } = require('../tools/currency');
const { shortenURL } = require('../tools/shorturl');

router.post('/qrcode', async (req, res) => {
  try {
    const { text, size, color } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'Body parameter "text" is required' });
    }
    const data = await generateQR(text, size, color);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/base64/encode', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'Body parameter "text" is required' });
    }
    const data = await encodeBase64(text);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/base64/decode', async (req, res) => {
  try {
    const { encoded } = req.body;
    if (!encoded) {
      return res.status(400).json({ success: false, error: 'Body parameter "encoded" is required' });
    }
    const data = await decodeBase64(encoded);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/ip/:ip', async (req, res) => {
  try {
    const data = await lookupIP(req.params.ip);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/currency', async (req, res) => {
  try {
    const { from, to, amount } = req.query;
    if (!from || !to || !amount) {
      return res.status(400).json({ success: false, error: 'Query parameters "from", "to", and "amount" are required' });
    }
    const data = await convertCurrency(from, to, amount);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/shorturl', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'Body parameter "url" is required' });
    }
    const data = await shortenURL(url);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
