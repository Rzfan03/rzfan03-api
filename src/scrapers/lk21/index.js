const { scrapeHome } = require('./home');
const { scrapeSearch } = require('./search');
const { scrapeDetail } = require('./detail');
const { scrapeGenre } = require('./genre');
const { scrapeCountry } = require('./country');
const { scrapeList } = require('./list');

module.exports = {
  scrapeHome,
  scrapeSearch,
  scrapeDetail,
  scrapeGenre,
  scrapeCountry,
  scrapeList,
};
