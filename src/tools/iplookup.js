const axios = require('axios');

async function lookupIP(ip) {
  if (!ip) throw new Error('IP address is required');

  const fields = 'status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting,query';
  const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=${fields}`;

  const { data } = await axios.get(url, { timeout: 10000 });
  if (data.status === 'fail') throw new Error(data.message || 'Lookup failed');
  return data;
}

module.exports = { lookupIP };
