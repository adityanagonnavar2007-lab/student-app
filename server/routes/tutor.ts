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

  const tutorResult = await generateTutorReply(userMessage.text, {
    studentName: db.profile.name,
    courses,
    tasks: db.tasks.filter(t => !t.done).map(t => ({ title: t.title, course: t.course, due: t.due }))
  });

  const executedActions: string[] = [];
  if (tutorResult.actions && Array.isArray(tutorResult.actions)) {
    for (const act of tutorResult.actions) {
      if (act.type === 'create_task' && act.data?.title) {
        const newTask = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          title: act.data.title,
          course: act.data.course || courses[0] || 'General Studies',
          due: act.data.due || 'This week',
          done: false,
          priority: (['High', 'Medium', 'Low'].includes(act.data.priority) ? act.data.priority : 'Medium') as 'High' | 'Medium' | 'Low',
          createdAt: new Date().toISOString()
        };
        db.tasks.push(newTask);
        executedActions.push(act.summary || `Added task: ${newTask.title}`);
      } else if (act.type === 'create_routine' && act.data?.title) {
        const newRoutine = {
          id: `r_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          title: act.data.title,
          time: act.data.time || 'Daily',
          detail: act.data.detail || 'Added by ContextAI Tutor',
          icon: act.data.icon || 'sparkles',
          color: 'bg-[#F8ECEF] text-[#741B2E]',
          added: true
        };
        db.routines.push(newRoutine);
        executedActions.push(act.summary || `Added routine: ${newRoutine.title}`);
      } else if (act.type === 'create_class' && act.data?.title) {
        const tones = [
          "bg-[#F3E1E6] text-[#8C3047]",
          "bg-[#F7E8EC] text-[#81283D]",
          "bg-[#FAE9ED] text-[#912C44]",
          "bg-[#F8ECEF] text-[#741B2E]"
        ];
        const newClass = {
          id: `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          title: act.data.title,
          time: act.data.time || '10:00',
          period: act.data.period || 'AM',
          room: act.data.room || 'Hall',
          courseCode: act.data.courseCode || '',
          tone: tones[db.schedule.length % tones.length],
          icon: (act.data.courseCode || act.data.title).slice(0, 2).toUpperCase()
        };
        db.schedule.push(newClass);
        executedActions.push(act.summary || `Added class: ${newClass.title}`);
      } else if (act.type === 'update_goal' && act.data?.weeklyGoalHours) {
        db.profile.weeklyGoalHours = Number(act.data.weeklyGoalHours);
        executedActions.push(act.summary || `Updated goal to ${db.profile.weeklyGoalHours}h`);
      }
    }
  }

  const aiMessage: ChatMessage = {
    id: `msg_${Date.now()}_ai`,
    from: 'ai',
    text: tutorResult.reply,
    timestamp: new Date().toISOString()
  };

  db.chat.push(aiMessage);
  writeDb(db);

  res.json({
    success: true,
    userMessage,
    aiMessage,
    chat: db.chat,
    executedActions,
    updatedData: {
      tasks: db.tasks,
      routines: db.routines,
      schedule: db.schedule,
      profile: db.profile
    }
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
