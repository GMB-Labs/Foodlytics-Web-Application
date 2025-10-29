// api/ssr.js
const path = require('node:path');
const { pathToFileURL } = require('node:url');

let cached = null;

module.exports = async function handler(req, res) {
    try {
        if (!cached) {
            // Import dinámico válido en CJS
            const { default: serverless } = await import('serverless-http');

            // Carga el bundle SSR que genera Angular
            const bundlePath = path.join(__dirname, '../dist/foodlytics/server/main.server.mjs');
            const mod = await import(pathToFileURL(bundlePath).href);

            // Acepta cualquiera de estas variantes de export
            const candidate =
                mod.app ?? mod.default ?? mod.server ?? mod.createApp ?? mod.handler;

            if (!candidate) {
                console.error('SSR bundle exports:', Object.keys(mod));
                throw new Error('No Express app export found in SSR bundle');
            }

            const expressApp = typeof candidate === 'function' ? candidate() : candidate;

            cached = serverless(expressApp);
        }

        // Log temporal para ver qué URL entra al SSR en un refresh
        console.log('SSR request:', req.url);

        return cached(req, res);
    } catch (err) {
        console.error('SSR handler failed:', err);
        res.statusCode = 500;
        res.end('SSR error');
    }
};