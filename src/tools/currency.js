const axios = require('axios');

async function convertCurrency(from, to, amount) {
  if (!from || !to) throw new Error('Currency codes are required');
  if (amount === undefined || amount === null) throw new Error('Amount is required');

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) throw new Error('Invalid amount');

  const fromUpper = from.toUpperCase();
  const toUpper = to.toUpperCase();

  const { data } = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromUpper}`, { timeout: 10000 });

  if (!data.rates || !data.rates[toUpper]) {
    throw new Error(`Currency "${toUpper}" not found`);
  }

  const rate = data.rates[toUpper];
  const result = Math.round(numAmount * rate * 100) / 100;

  return { from: fromUpper, to: toUpper, amount: numAmount, result, rate, date: data.date };
}

module.exports = { convertCurrency };
