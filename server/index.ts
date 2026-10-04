import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

import tasksRouter from './routes/tasks.js';
import routinesRouter from './routes/routines.js';
import scheduleRouter from './routes/schedule.js';
import tutorRouter from './routes/tutor.js';
import profileRouter from './routes/profile.js';
import progressRouter from './routes/progress.js';
import searchRouter from './routes/search.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : (process.env.BACKEND_PORT ? parseInt(process.env.BACKEND_PORT, 10) : 5000);

app.use(cors());
app.use(express.json());

// API health endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    appName: 'ContextAI Student Workspace Backend',
    timestamp: new Date().toISOString()
  });
});

// Mounted Routes
app.use('/api/profile', profileRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/routines', routinesRouter);
app.use('/api/tutor', tutorRouter);
app.use('/api/progress', progressRouter);
app.use('/api/search', searchRouter);

// 404 handler for API routes
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Serve frontend production build if available
const DIST_DIR = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));

  // SPA fallback for all frontend client routes
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      const indexPath = path.join(DIST_DIR, 'index.html');
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
    }
    next();
  });
}

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Backend Server Error]:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 ContextAI Backend API is running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log(`   Tasks API:   http://localhost:${PORT}/api/tasks`);
    console.log(`   Tutor API:   http://localhost:${PORT}/api/tutor`);
  });
}

export default app;
