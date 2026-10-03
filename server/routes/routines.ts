import { Router, Request, Response } from 'express';
import { readDb, writeDb, RoutineItem } from '../db.js';

const router = Router();

// GET all routines
router.get('/', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, routines: db.routines });
});

// POST new custom routine
router.post('/', (req: Request, res: Response) => {
  const { time, title, detail, icon, color } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Routine title is required' });
  }

  const db = readDb();
  const newRoutine: RoutineItem = {
    id: `routine_${Date.now()}`,
    time: time || 'Flexible',
    title: String(title).trim(),
    detail: detail || 'Custom personal routine for enhanced focus.',
    icon: icon || 'target',
    color: color || 'bg-[#F8ECEF] text-[#741B2E]',
    added: true
  };

  db.routines.push(newRoutine);
  writeDb(db);

  res.status(201).json({ success: true, routine: newRoutine });
});

// PATCH toggle added status
router.patch('/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();
  const routine = db.routines.find(r => r.id === id);

  if (!routine) {
    return res.status(404).json({ error: 'Routine not found' });
  }

  routine.added = !routine.added;
  writeDb(db);

  res.json({ success: true, routine });
});

// DELETE routine
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();
  const initialLength = db.routines.length;
  db.routines = db.routines.filter(r => r.id !== id);

  if (db.routines.length === initialLength) {
    return res.status(404).json({ error: 'Routine not found' });
  }

  writeDb(db);
  res.json({ success: true, message: 'Routine removed' });
});

export default router;
