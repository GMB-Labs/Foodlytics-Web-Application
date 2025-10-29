declare module '*.server.mjs' {
    import type { Express } from 'express';
    export const app: () => Express;
}