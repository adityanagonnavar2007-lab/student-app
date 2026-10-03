import { Router, Request, Response } from 'express';
import { readDb, writeDb } from '../db.js';

const router = Router();

// GET profile
router.get('/', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, profile: db.profile });
});

// PUT update profile
router.put('/', (req: Request, res: Response) => {
  const db = readDb();
  db.profile = {
    ...db.profile,
    ...req.body
  };
  writeDb(db);
  res.json({ success: true, profile: db.profile });
});

// POST reset to fresh/empty state for live entry
router.post('/fresh', (_req: Request, res: Response) => {
  const db = readDb();
  db.tasks = [];
  db.schedule = [];
  db.routines = [];
  db.focusSessions = [];
  db.profile.weeklyLoggedHours = 0;
  db.chat = [
    {
      id: `msg_${Date.now()}`,
      from: 'ai',
      text: `Hi ${db.profile.name.split(' ')[0]}. Your workspace is cleared and ready for your live data. Add your courses, classes, and assignments!`,
      timestamp: new Date().toISOString()
    }
  ];
  writeDb(db);
  res.json({ success: true, message: 'Workspace cleared for live entry', db });
});

export default router;
