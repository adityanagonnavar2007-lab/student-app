import { Router, Request, Response } from 'express';
import { readDb } from '../db.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  if (!q) {
    return res.json({ success: true, results: { tasks: [], routines: [], schedule: [] } });
  }

  const db = readDb();
  const matchedTasks = db.tasks.filter(t =>
    t.title.toLowerCase().includes(q) || t.course.toLowerCase().includes(q)
  );

  const matchedRoutines = db.routines.filter(r =>
    r.title.toLowerCase().includes(q) || r.detail.toLowerCase().includes(q)
  );

  const matchedSchedule = db.schedule.filter(s =>
    s.title.toLowerCase().includes(q) || s.room.toLowerCase().includes(q) || (s.courseCode && s.courseCode.toLowerCase().includes(q))
  );

  res.json({
    success: true,
    query: q,
    results: {
      tasks: matchedTasks,
      routines: matchedRoutines,
      schedule: matchedSchedule,
      totalCount: matchedTasks.length + matchedRoutines.length + matchedSchedule.length
    }
  });
});

export default router;
