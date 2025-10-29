// api/ssr.js  (CommonJS, defensivo)
const path = require('node:path');
const { pathToFileURL } = require('node:url');

let cached = null;

module.exports = async function handler(req, res) {
    try {
        if (!cached) {
            const { default: serverless } = await import('serverless-http');

            const bundlePath = path.join(__dirname, '../dist/foodlytics/server/main.server.mjs');
            const mod = await import(pathToFileURL(bundlePath).href);

            // Intentamos distintas convenciones de export
            const candidate =
                mod.app ??            // { app: Express | () => Express }
                mod.default ??        // export default app | () => app
                mod.server ??         // { server: Express | () => Express }
                mod.createApp ??      // { createApp: () => Express }
                mod.handler;          // { handler: Express | () => Express }

            if (!candidate) {
                console.error('SSR bundle exports:', Object.keys(mod));
                throw new Error('No Express app export found in SSR bundle');
            }

            // Si es función, la invocamos; si ya es instancia, la usamos tal cual
            const expressApp = typeof candidate === 'function' ? candidate() : candidate;

            cached = serverless(expressApp);
        }
        return cached(req, res);
    } catch (err) {
        console.error('SSR handler failed:', err);
        res.statusCode = 500;
        res.end('SSR error');
    }
};