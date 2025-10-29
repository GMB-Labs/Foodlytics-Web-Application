// api/ssr.js
const path = require('node:path');
const { pathToFileURL } = require('node:url');

let cached = null;

module.exports = async function handler(req, res) {
    try {
        if (!cached) {
            const serverless = (await import('serverless-http')).default;

            const bundlePath = path.join(__dirname, '../dist/foodlytics/server/main.server.mjs');
            const { app: createApp } = await import(pathToFileURL(bundlePath).href);

            const expressApp = createApp();
            cached = serverless(expressApp);
        }
        return cached(req, res);
    } catch (err) {
        console.error('SSR handler failed:', err);
        res.statusCode = 500;
        res.end('SSR error');
    }
};