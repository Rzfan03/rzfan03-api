const axios = require('axios');

async function shortenURL(url) {
    if (!url) throw new Error('URL is required');

    try {
        new URL(url);
    } catch {
        throw new Error('Invalid URL format');
    }

    try {
        const { data } = await axios.post(
            'https://cleanuri.com/api/v1/shorten',
            `url=${encodeURIComponent(url)}`,
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                timeout: 10000
            }
        );

        if (data.error) throw new Error(data.error);

        return {
            original: url,
            short: data.result_url
        };
    } catch (err) {
        if (err.message.includes('Invalid URL')) throw err;
        throw new Error(`URL shortening failed: ${err.message}`);
    }
}

module.exports = { shortenURL };
