import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { WebSocketServer } from 'ws';
import helmet from 'helmet';

import { bootstrapAzureEnv } from './utils/azureStartup';
import { buildHealthResponse } from './utils/healthChecks';
import { registry } from './db/registry';

import applicationsRouter from './routes/applications';
import documentsRouter from './routes/documents';
import ocrRouter from './routes/ocr';
import bankingRouter from './routes/banking';
import chatRouter from './routes/chat';
import lendersRouter from './routes/lenders';
import signingRouter from './routes/signing';
import timelineRouter from './routes/timeline';
import internalRouter from './routes/_internal';

import { wsHub } from './services/wsHub';

(async function start() {
  console.log('🔥 Staff-Server starting...');

  // Load all Azure env vars + verify critical values
  const config = bootstrapAzureEnv();

  // Attempt DB connection with retry logic
  console.log('⏳ Connecting to Postgres...');
  await registry.$client.connect();
  console.log('✅ Postgres connected.');

  const app = express();
  const server = http.createServer(app);

  // ----------------------------
  // SECURITY
  // ----------------------------
  app.use(helmet());
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
    cors({
      origin: config.ALLOWED_ORIGINS,
      credentials: true,
    })
  );

  // ----------------------------
  // HEALTH ROUTES
  // ----------------------------
  app.get('/api/_int/health', async (req, res) => {
    const status = await buildHealthResponse();
    res.status(status.ok ? 200 : 500).json(status);
  });

  app.get('/api/_int/build', (req, res) => {
    res.json({
      ok: true,
      version: config.SERVER_VERSION,
      environment: config.NODE_ENV,
    });
  });

  app.get('/api/_int/db', async (req, res) => {
    try {
      await registry.$client.query('SELECT 1');
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  app.get('/api/_int/routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach((r: any) => {
      if (r.route && r.route.path) {
        routes.push({
          method: Object.keys(r.route.methods)[0],
          path: r.route.path,
        });
      }
    });
    res.json(routes);
  });

  // ----------------------------
  // API ROUTES
  // ----------------------------
  app.use('/api/applications', applicationsRouter);
  app.use('/api/documents', documentsRouter);
  app.use('/api/ocr', ocrRouter);
  app.use('/api/banking', bankingRouter);
  app.use('/api/chat', chatRouter);
  app.use('/api/lenders', lendersRouter);
  app.use('/api/signing', signingRouter);
  app.use('/api/timeline', timelineRouter);
  app.use('/api/_internal', internalRouter);

  // 404 FALLBACK
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  // ----------------------------
  // WEBSOCKET SERVER
  // ----------------------------
  const wss = new WebSocketServer({ server });
  wsHub.initialize(wss);

  // ----------------------------
  // SERVER START
  // ----------------------------
  const PORT = config.PORT;
  server.listen(PORT, () => {
    console.log(`🚀 Staff API running on port ${PORT}`);
    console.log(`🌐 Environment: ${config.NODE_ENV}`);
    console.log(`📦 Version: ${config.SERVER_VERSION}`);
  });

  // Graceful shutdown handling
  process.on('SIGTERM', async () => {
    console.log('⏳ Graceful shutdown...');
    try {
      await registry.$client.end();
      server.close(() => {
        console.log('🔌 Server closed.');
        process.exit(0);
      });
    } catch (err) {
      console.error('❌ Shutdown error:', err);
      process.exit(1);
    }
  });
})();
