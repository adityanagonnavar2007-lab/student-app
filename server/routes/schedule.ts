import { Router, Request, Response } from 'express';
import { readDb, writeDb, ClassScheduleItem } from '../db.js';

const router = Router();

// GET classes schedule
router.get('/', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, schedule: db.schedule });
});

// POST add class to schedule
router.post('/', (req: Request, res: Response) => {
  const { time, period, title, room, tone, icon, courseCode } = req.body;
  if (!title || !time) {
    return res.status(400).json({ error: 'Title and time are required' });
  }

  const db = readDb();
  const newClass: ClassScheduleItem = {
    id: `class_${Date.now()}`,
    time: String(time).trim(),
    period: period || 'AM',
    title: String(title).trim(),
    room: room || 'Classroom',
    tone: tone || 'bg-[#F3E1E6] text-[#8C3047]',
    icon: icon || title.slice(0, 2).toUpperCase(),
    courseCode: courseCode || ''
  };

  db.schedule.push(newClass);
  writeDb(db);

  res.status(201).json({ success: true, class: newClass });
});

// DELETE class
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();
  db.schedule = db.schedule.filter(c => c.id !== id);
  writeDb(db);
  res.json({ success: true, message: 'Class removed' });
});

export default router;
