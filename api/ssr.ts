// api/ssr.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import serverless from 'serverless-http';
import type { Express } from 'express';
import e = require("express");

let cached: ReturnType<typeof serverless> | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (!cached) {
            const bundleUrl = new URL('../dist/foodlytics/server/main.server.mjs', import.meta.url);
            const { app: createApp } = await import(bundleUrl.href);
            const expressApp: Express = createApp();
            cached = serverless(expressApp);
        }
        return (cached as any)(req, res);
    } catch (err) {
        console.error('SSR handler failed:', err);
        res.status(500).end('SSR error');
    }
}