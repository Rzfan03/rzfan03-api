const QRCode = require('qrcode');

async function generateQR(text, options = {}) {
    if (!text) throw new Error('Text is required');

    const {
        size = 300,
        color = '#000000',
        dark,
        light
    } = options;

    const qrOptions = {
        width: size,
        margin: 2,
        color: {
            dark: dark || color,
            light: light || '#ffffff'
        },
        errorCorrectionLevel: 'M'
    };

    try {
        const qr = await QRCode.toDataURL(text, qrOptions);
        return { qr, text };
    } catch (err) {
        throw new Error(`Failed to generate QR code: ${err.message}`);
    }
}

module.exports = { generateQR };
