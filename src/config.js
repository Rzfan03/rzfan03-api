require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  urls: {
    anime: 'https://samehadaku.io',
    lk21: 'https://tv.lk21official.asia',
    manga: 'https://komiku.org',
  },
};
