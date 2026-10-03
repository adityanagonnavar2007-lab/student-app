import { Router, Request, Response } from 'express';
import { readDb, writeDb, FocusSession } from '../db.js';

const router = Router();

// GET progress summary
router.get('/', (_req: Request, res: Response) => {
  const db = readDb();
  const totalTasks = db.tasks.length;
  const completedTasks = db.tasks.filter(t => t.done).length;
  const remainingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalFocusMinutes = db.focusSessions.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

  res.json({
    success: true,
    summary: {
      completionRate,
      completedTasks,
      remainingTasks,
      totalTasks,
      weeklyGoalHours: db.profile.weeklyGoalHours,
      weeklyLoggedHours: db.profile.weeklyLoggedHours,
      focusStreakDays: db.profile.focusStreakDays,
      totalFocusMinutes,
      focusSessions: db.focusSessions
    }
  });
});

// POST log focus session
router.post('/focus-session', (req: Request, res: Response) => {
  const { durationMinutes, topic } = req.body;
  const minutes = Number(durationMinutes) || 50;

  const db = readDb();
  const session: FocusSession = {
    id: `focus_${Date.now()}`,
    durationMinutes: minutes,
    topic: topic || 'General Study',
    timestamp: new Date().toISOString()
  };

  db.focusSessions.push(session);
  // Add to logged hours
  db.profile.weeklyLoggedHours = Math.round((db.profile.weeklyLoggedHours + (minutes / 60)) * 10) / 10;
  writeDb(db);

  res.status(201).json({ success: true, session, profile: db.profile });
});

export default router;
