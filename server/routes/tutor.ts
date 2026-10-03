import { Router, Request, Response } from 'express';
import { readDb, writeDb, ChatMessage } from '../db.js';
import { generateTutorReply } from '../services/tutorService.js';

const router = Router();

// GET all chat history
router.get('/', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, chat: db.chat });
});

// POST send message to tutor
router.post('/chat', async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  const db = readDb();
  const userMessage: ChatMessage = {
    id: `msg_${Date.now()}_u`,
    from: 'user',
    text: message.trim(),
    timestamp: new Date().toISOString()
  };

  db.chat.push(userMessage);

  // Provide course context to the tutor
  const courses = Array.from(new Set([
    ...db.schedule.map(s => s.title),
    ...db.tasks.map(t => t.course)
  ]));

  const tutorReplyText = await generateTutorReply(userMessage.text, {
    studentName: db.profile.name,
    courses,
    tasks: db.tasks.filter(t => !t.done).map(t => ({ title: t.title, course: t.course, due: t.due }))
  });

  const aiMessage: ChatMessage = {
    id: `msg_${Date.now()}_ai`,
    from: 'ai',
    text: tutorReplyText,
    timestamp: new Date().toISOString()
  };

  db.chat.push(aiMessage);
  writeDb(db);

  res.json({
    success: true,
    userMessage,
    aiMessage,
    chat: db.chat
  });
});

// DELETE clear chat history (reset to greeting)
router.delete('/clear', (_req: Request, res: Response) => {
  const db = readDb();
  db.chat = [
    {
      id: `msg_${Date.now()}`,
      from: 'ai',
      text: `Hi ${db.profile.name.split(' ')[0]}. What would you like to understand better today?`,
      timestamp: new Date().toISOString()
    }
  ];
  writeDb(db);
  res.json({ success: true, chat: db.chat });
});

export default router;
