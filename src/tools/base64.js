function encodeBase64(text) {
    if (text === undefined || text === null) throw new Error('Text is required');
    const str = String(text);
    const encoded = Buffer.from(str).toString('base64');
    return { encoded, original: str };
}

function decodeBase64(encoded) {
    if (!encoded) throw new Error('Encoded string is required');
    const str = String(encoded);
    try {
        const decoded = Buffer.from(str, 'base64').toString('utf-8');
        return { decoded, original: str };
    } catch {
        throw new Error('Invalid base64 string');
    }
}

module.exports = { encodeBase64, decodeBase64 };
