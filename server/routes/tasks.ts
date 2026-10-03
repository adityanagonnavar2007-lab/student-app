import { Router, Request, Response } from 'express';
import { readDb, writeDb, TaskItem } from '../db.js';

const router = Router();

// GET all tasks
router.get('/', (req: Request, res: Response) => {
  const db = readDb();
  let tasks = db.tasks;

  const priority = req.query.priority as string;
  if (priority) {
    tasks = tasks.filter(t => t.priority.toLowerCase() === priority.toLowerCase());
  }

  const done = req.query.done as string;
  if (done !== undefined) {
    tasks = tasks.filter(t => t.done === (done === 'true'));
  }

  res.json({ success: true, tasks });
});

// POST new task
router.post('/', (req: Request, res: Response) => {
  const { title, course, due, priority } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const db = readDb();
  const newTask: TaskItem = {
    id: Date.now(),
    title: String(title).trim(),
    course: String(course || 'General').trim(),
    due: String(due || 'This week').trim(),
    done: false,
    priority: (priority === 'High' || priority === 'Low') ? priority : 'Medium',
    createdAt: new Date().toISOString()
  };

  db.tasks.push(newTask);
  writeDb(db);

  res.status(201).json({ success: true, task: newTask });
});

// PATCH toggle task completion
router.patch('/:id/toggle', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const db = readDb();
  const task = db.tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  task.done = !task.done;
  task.completedAt = task.done ? new Date().toISOString() : undefined;
  writeDb(db);

  res.json({ success: true, task });
});

// PUT update task
router.put('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const db = readDb();
  const index = db.tasks.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, course, due, done, priority } = req.body;
  db.tasks[index] = {
    ...db.tasks[index],
    ...(title !== undefined ? { title: String(title).trim() } : {}),
    ...(course !== undefined ? { course: String(course).trim() } : {}),
    ...(due !== undefined ? { due: String(due).trim() } : {}),
    ...(done !== undefined ? { done: Boolean(done) } : {}),
    ...(priority !== undefined ? { priority } : {})
  };

  writeDb(db);
  res.json({ success: true, task: db.tasks[index] });
});

// DELETE task
router.delete('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const db = readDb();
  const initialLength = db.tasks.length;
  db.tasks = db.tasks.filter(t => t.id !== id);

  if (db.tasks.length === initialLength) {
    return res.status(404).json({ error: 'Task not found' });
  }

  writeDb(db);
  res.json({ success: true, message: 'Task deleted successfully' });
});

export default router;
