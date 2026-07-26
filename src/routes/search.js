const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) {
      return res.status(400).json({ success: false, error: 'Query parameter "q" is required' });
    }

    const [animeResult, lk21Result, mangaResult] = await Promise.allSettled([
      require('../scrapers/anime/search').scrapeSearch(q),
      require('../scrapers/lk21/search').scrapeSearch(q),
      require('../scrapers/manga/search').searchManga(q)
    ]);

    const data = {
      anime: animeResult.status === 'fulfilled' && animeResult.value?.results
        ? { count: animeResult.value.results.length, items: animeResult.value.results }
        : { count: 0, items: [] },
      lk21: lk21Result.status === 'fulfilled' && lk21Result.value?.movies
        ? { count: lk21Result.value.movies.length, items: lk21Result.value.movies }
        : { count: 0, items: [] },
      manga: mangaResult.status === 'fulfilled' && Array.isArray(mangaResult.value)
        ? { count: mangaResult.value.length, items: mangaResult.value }
        : { count: 0, items: [] }
    };

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
