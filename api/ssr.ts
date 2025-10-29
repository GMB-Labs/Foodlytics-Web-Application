// api/ssr.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Express } from 'express';
import {join} from "node:path";
import {pathToFileURL} from "node:url";

let cached: any = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (!cached) {
            const serverless = (await import('serverless-http')).default;
            const bundlePath = join(__dirname, '../dist/foodlytics/server/main.server.mjs');
            const { app: createApp } = await import(pathToFileURL(bundlePath).href);
            const expressApp: Express = createApp();
            cached = serverless(expressApp);
        }
        return (cached as any)(req, res);
    } catch (err) {
        console.error('SSR handler failed:', err);
        res.status(500).end('SSR error');
    }
}