// api/ssr.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import serverless from 'serverless-http';
import type { Express } from 'express';

let cached: ReturnType<typeof serverless> | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!cached) {
        const { app: createApp } = await import('../dist/foodlytics/server/main.server.mjs');
        const expressApp: Express = createApp();
        cached = serverless(expressApp);
    }
    return (cached as any)(req, res);
}