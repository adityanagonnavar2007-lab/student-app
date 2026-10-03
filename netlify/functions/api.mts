import type { Config } from "@netlify/functions";
import { asc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { chatMessages, focusSessions, profile, routines, schedule, tasks } from "../../db/schema.js";
import { generateTutorReply } from "../../server/services/tutorService.js";

const PROFILE_ID = 1;

const json = (data: unknown, status = 200) => Response.json(data, { status });

async function readBody(req: Request): Promise<Record<string, any>> {
  try {
    return (await req.json()) ?? {};
  } catch {
    return {};
  }
}

// Seeds the workspace with starter data the first time it is accessed.
async function ensureSeeded() {
  const existing = await db.select({ id: profile.id }).from(profile).where(eq(profile.id, PROFILE_ID));
  if (existing.length > 0) return;

  const inserted = await db
    .insert(profile)
    .values({
      id: PROFILE_ID,
      name: "Aditya Nagonnavr",
      initials: "AK",
      major: "Computer Science",
      focusStreakDays: 6,
      weeklyGoalHours: 20,
      weeklyLoggedHours: 17,
      avatarColor: "bg-[#F0D8DE]",
      badgeColor: "text-[#741B2E]",
    })
    .onConflictDoNothing()
    .returning();
  // Another request seeded concurrently.
  if (inserted.length === 0) return;

  const now = Date.now();
  await db.insert(schedule).values([
    { id: "1", time: "9:00", period: "AM", title: "Data Structures", room: "Room 204", tone: "bg-[#F3E1E6] text-[#8C3047]", icon: "DS", courseCode: "CS 201" },
    { id: "2", time: "11:30", period: "AM", title: "Design Thinking", room: "Studio 3", tone: "bg-[#F7E8EC] text-[#81283D]", icon: "DT", courseCode: "DES 210" },
    { id: "3", time: "2:30", period: "PM", title: "Project Lab", room: "Innovation Hub", tone: "bg-[#FAE9ED] text-[#912C44]", icon: "PL", courseCode: "CS 304" },
  ]).onConflictDoNothing();
  await db.insert(tasks).values([
    { id: 1, title: "Database systems quiz", course: "CS 304", due: "Today, 5:00 PM", done: false, priority: "High" },
    { id: 2, title: "Submit UX case study", course: "DES 210", due: "Tomorrow", done: false, priority: "Medium" },
    { id: 3, title: "Review graph algorithms", course: "CS 201", due: "Friday", done: true, priority: "Low", completedAt: new Date(now) },
  ]).onConflictDoNothing();
  await db.insert(routines).values([
    { id: "1", time: "6:30 AM", title: "Wake up & hydrate", detail: "Start with a glass of water and five minutes of sunlight.", icon: "clock", color: "bg-[#F8ECEF] text-[#741B2E]", added: true },
    { id: "2", time: "7:00 AM", title: "Move for 20 minutes", detail: "Walk, stretch, or do light exercise before sitting down to study.", icon: "target", color: "bg-[#FAE9ED] text-[#912C44]", added: true },
    { id: "3", time: "8:00 AM", title: "Plan the top three", detail: "Choose three realistic priorities for classes and assignments.", icon: "check", color: "bg-[#F3E1E6] text-[#8C3047]", added: true },
    { id: "4", time: "4:30 PM", title: "Focused revision", detail: "Review one difficult topic for 45 minutes without notifications.", icon: "book", color: "bg-[#F7E8EC] text-[#81283D]", added: false },
    { id: "5", time: "7:30 PM", title: "Quick recall practice", detail: "Close your notes and write down what you remember for 15 minutes.", icon: "sparkles", color: "bg-[#F5E2E7] text-[#7D2A3D]", added: false },
    { id: "6", time: "10:30 PM", title: "Digital wind-down", detail: "Put screens away, prepare for tomorrow, and aim for 7–8 hours of sleep.", icon: "clock", color: "bg-[#F5EFF1] text-[#795A63]", added: false },
  ]).onConflictDoNothing();
  await db.insert(chatMessages).values({ id: "1", from: "ai", text: "Hi Aditya. What would you like to understand better today?" }).onConflictDoNothing();
  await db.insert(focusSessions).values({ id: "1", durationMinutes: 50, topic: "Graph Algorithms" }).onConflictDoNothing();
}

async function getProfile() {
  const [row] = await db.select().from(profile).where(eq(profile.id, PROFILE_ID));
  const { id: _id, ...rest } = row;
  return rest;
}

const serializeTask = (t: typeof tasks.$inferSelect) => ({
  id: t.id,
  title: t.title,
  course: t.course,
  due: t.due,
  done: t.done,
  priority: t.priority,
  createdAt: t.createdAt.toISOString(),
  completedAt: t.completedAt ? t.completedAt.toISOString() : undefined,
});

const serializeClass = ({ createdAt: _c, ...rest }: typeof schedule.$inferSelect) => rest;
const serializeRoutine = ({ createdAt: _c, ...rest }: typeof routines.$inferSelect) => rest;
const serializeChat = ({ seq: _s, timestamp, ...rest }: typeof chatMessages.$inferSelect) => ({ ...rest, timestamp: timestamp.toISOString() });
const serializeFocus = (f: typeof focusSessions.$inferSelect) => ({
  id: f.id,
  durationMinutes: f.durationMinutes,
  topic: f.topic ?? undefined,
  timestamp: f.timestamp.toISOString(),
});

const listTasks = async () => (await db.select().from(tasks).orderBy(asc(tasks.createdAt), asc(tasks.id))).map(serializeTask);
const listSchedule = async () => (await db.select().from(schedule).orderBy(asc(schedule.createdAt), asc(schedule.id))).map(serializeClass);
const listRoutines = async () => (await db.select().from(routines).orderBy(asc(routines.createdAt), asc(routines.id))).map(serializeRoutine);
const listChat = async () => (await db.select().from(chatMessages).orderBy(asc(chatMessages.seq))).map(serializeChat);
const listFocus = async () => (await db.select().from(focusSessions).orderBy(asc(focusSessions.timestamp))).map(serializeFocus);

async function resetChat(text: string) {
  await db.delete(chatMessages);
  await db.insert(chatMessages).values({ id: `msg_${Date.now()}`, from: "ai", text });
}

export default async (req: Request) => {
  const url = new URL(req.url);
  const segments = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  const [resource, id, action] = segments;
  const method = req.method;

  try {
    await ensureSeeded();

    if (resource === "health" && method === "GET") {
      return json({ status: "ok", appName: "ContextAI Student Workspace Backend", timestamp: new Date().toISOString() });
    }

    // Profile
    if (resource === "profile") {
      if (!id && method === "GET") return json({ success: true, profile: await getProfile() });

      if (!id && method === "PUT") {
        const body = await readBody(req);
        const updates: Partial<typeof profile.$inferInsert> = {};
        for (const key of ["name", "initials", "major", "avatarColor", "badgeColor"] as const) {
          if (typeof body[key] === "string") updates[key] = body[key];
        }
        for (const key of ["focusStreakDays", "weeklyGoalHours", "weeklyLoggedHours"] as const) {
          if (body[key] !== undefined && Number.isFinite(Number(body[key]))) updates[key] = Number(body[key]);
        }
        if (Object.keys(updates).length > 0) {
          await db.update(profile).set(updates).where(eq(profile.id, PROFILE_ID));
        }
        return json({ success: true, profile: await getProfile() });
      }

      if (id === "fresh" && method === "POST") {
        await db.delete(tasks);
        await db.delete(schedule);
        await db.delete(routines);
        await db.delete(focusSessions);
        await db.update(profile).set({ weeklyLoggedHours: 0 }).where(eq(profile.id, PROFILE_ID));
        const p = await getProfile();
        await resetChat(`Hi ${p.name.split(" ")[0]}. Your workspace is cleared and ready for your live data. Add your courses, classes, and assignments!`);
        return json({ success: true, message: "Workspace cleared for live entry" });
      }
    }

    // Schedule
    if (resource === "schedule") {
      if (!id && method === "GET") return json({ success: true, schedule: await listSchedule() });

      if (!id && method === "POST") {
        const { time, period, title, room, tone, icon, courseCode } = await readBody(req);
        if (!title || !time) return json({ error: "Title and time are required" }, 400);
        const [row] = await db
          .insert(schedule)
          .values({
            id: `class_${Date.now()}`,
            time: String(time).trim(),
            period: period || "AM",
            title: String(title).trim(),
            room: room || "Classroom",
            tone: tone || "bg-[#F3E1E6] text-[#8C3047]",
            icon: icon || String(title).slice(0, 2).toUpperCase(),
            courseCode: courseCode || "",
          })
          .returning();
        return json({ success: true, class: serializeClass(row) }, 201);
      }

      if (id && method === "DELETE") {
        await db.delete(schedule).where(eq(schedule.id, id));
        return json({ success: true, message: "Class removed" });
      }
    }

    // Tasks
    if (resource === "tasks") {
      if (!id && method === "GET") {
        let list = await listTasks();
        const priority = url.searchParams.get("priority");
        if (priority) list = list.filter((t) => t.priority.toLowerCase() === priority.toLowerCase());
        const done = url.searchParams.get("done");
        if (done !== null) list = list.filter((t) => t.done === (done === "true"));
        return json({ success: true, tasks: list });
      }

      if (!id && method === "POST") {
        const { title, course, due, priority } = await readBody(req);
        if (!title) return json({ error: "Title is required" }, 400);
        const [row] = await db
          .insert(tasks)
          .values({
            id: Date.now(),
            title: String(title).trim(),
            course: String(course || "General").trim(),
            due: String(due || "This week").trim(),
            done: false,
            priority: priority === "High" || priority === "Low" ? priority : "Medium",
          })
          .returning();
        return json({ success: true, task: serializeTask(row) }, 201);
      }

      const taskId = Number(id);
      if (id && Number.isFinite(taskId)) {
        const [existing] = await db.select().from(tasks).where(eq(tasks.id, taskId));
        if (!existing) return json({ error: "Task not found" }, 404);

        if (action === "toggle" && method === "PATCH") {
          const done = !existing.done;
          const [row] = await db
            .update(tasks)
            .set({ done, completedAt: done ? new Date() : null })
            .where(eq(tasks.id, taskId))
            .returning();
          return json({ success: true, task: serializeTask(row) });
        }

        if (!action && method === "PUT") {
          const { title, course, due, done, priority } = await readBody(req);
          const updates: Partial<typeof tasks.$inferInsert> = {};
          if (title !== undefined) updates.title = String(title).trim();
          if (course !== undefined) updates.course = String(course).trim();
          if (due !== undefined) updates.due = String(due).trim();
          if (done !== undefined) updates.done = Boolean(done);
          if (priority === "High" || priority === "Medium" || priority === "Low") updates.priority = priority;
          const [row] = Object.keys(updates).length
            ? await db.update(tasks).set(updates).where(eq(tasks.id, taskId)).returning()
            : [existing];
          return json({ success: true, task: serializeTask(row) });
        }

        if (!action && method === "DELETE") {
          await db.delete(tasks).where(eq(tasks.id, taskId));
          return json({ success: true, message: "Task deleted successfully" });
        }
      }
    }

    // Routines
    if (resource === "routines") {
      if (!id && method === "GET") return json({ success: true, routines: await listRoutines() });

      if (!id && method === "POST") {
        const { time, title, detail, icon, color } = await readBody(req);
        if (!title) return json({ error: "Routine title is required" }, 400);
        const [row] = await db
          .insert(routines)
          .values({
            id: `routine_${Date.now()}`,
            time: time || "Flexible",
            title: String(title).trim(),
            detail: detail || "Custom personal routine for enhanced focus.",
            icon: icon || "target",
            color: color || "bg-[#F8ECEF] text-[#741B2E]",
            added: true,
          })
          .returning();
        return json({ success: true, routine: serializeRoutine(row) }, 201);
      }

      if (id) {
        const [existing] = await db.select().from(routines).where(eq(routines.id, id));
        if (!existing) return json({ error: "Routine not found" }, 404);

        if (action === "toggle" && method === "PATCH") {
          const [row] = await db.update(routines).set({ added: !existing.added }).where(eq(routines.id, id)).returning();
          return json({ success: true, routine: serializeRoutine(row) });
        }

        if (!action && method === "DELETE") {
          await db.delete(routines).where(eq(routines.id, id));
          return json({ success: true, message: "Routine removed" });
        }
      }
    }

    // AI tutor
    if (resource === "tutor") {
      if (!id && method === "GET") return json({ success: true, chat: await listChat() });

      if (id === "chat" && method === "POST") {
        const { message } = await readBody(req);
        if (!message || typeof message !== "string" || !message.trim()) {
          return json({ error: "Message cannot be empty" }, 400);
        }

        const [userRow] = await db
          .insert(chatMessages)
          .values({ id: `msg_${Date.now()}_u`, from: "user", text: message.trim() })
          .returning();

        const [p, taskList, classList] = await Promise.all([getProfile(), listTasks(), listSchedule()]);
        const courses = Array.from(new Set([...classList.map((s) => s.title), ...taskList.map((t) => t.course)]));
        const replyText = await generateTutorReply(userRow.text, {
          studentName: p.name,
          courses,
          tasks: taskList.filter((t) => !t.done).map((t) => ({ title: t.title, course: t.course, due: t.due })),
        });

        const [aiRow] = await db
          .insert(chatMessages)
          .values({ id: `msg_${Date.now()}_ai`, from: "ai", text: replyText })
          .returning();

        return json({
          success: true,
          userMessage: serializeChat(userRow),
          aiMessage: serializeChat(aiRow),
          chat: await listChat(),
        });
      }

      if (id === "clear" && method === "DELETE") {
        const p = await getProfile();
        await resetChat(`Hi ${p.name.split(" ")[0]}. What would you like to understand better today?`);
        return json({ success: true, chat: await listChat() });
      }
    }

    // Progress
    if (resource === "progress") {
      if (!id && method === "GET") {
        const [p, taskList, sessions] = await Promise.all([getProfile(), listTasks(), listFocus()]);
        const totalTasks = taskList.length;
        const completedTasks = taskList.filter((t) => t.done).length;
        return json({
          success: true,
          summary: {
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
            completedTasks,
            remainingTasks: totalTasks - completedTasks,
            totalTasks,
            weeklyGoalHours: p.weeklyGoalHours,
            weeklyLoggedHours: p.weeklyLoggedHours,
            focusStreakDays: p.focusStreakDays,
            totalFocusMinutes: sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0),
            focusSessions: sessions,
          },
        });
      }

      if (id === "focus-session" && method === "POST") {
        const { durationMinutes, topic } = await readBody(req);
        const minutes = Number(durationMinutes) || 50;
        const [row] = await db
          .insert(focusSessions)
          .values({ id: `focus_${Date.now()}`, durationMinutes: minutes, topic: topic || "General Study" })
          .returning();
        const current = await getProfile();
        await db
          .update(profile)
          .set({ weeklyLoggedHours: Math.round((current.weeklyLoggedHours + minutes / 60) * 10) / 10 })
          .where(eq(profile.id, PROFILE_ID));
        return json({ success: true, session: serializeFocus(row), profile: await getProfile() }, 201);
      }
    }

    // Search
    if (resource === "search" && method === "GET") {
      const q = (url.searchParams.get("q") || "").trim().toLowerCase();
      if (!q) return json({ success: true, results: { tasks: [], routines: [], schedule: [], totalCount: 0 } });

      const [taskList, routineList, classList] = await Promise.all([listTasks(), listRoutines(), listSchedule()]);
      const matchedTasks = taskList.filter((t) => t.title.toLowerCase().includes(q) || t.course.toLowerCase().includes(q));
      const matchedRoutines = routineList.filter((r) => r.title.toLowerCase().includes(q) || r.detail.toLowerCase().includes(q));
      const matchedSchedule = classList.filter(
        (s) => s.title.toLowerCase().includes(q) || s.room.toLowerCase().includes(q) || s.courseCode.toLowerCase().includes(q),
      );
      return json({
        success: true,
        query: q,
        results: {
          tasks: matchedTasks,
          routines: matchedRoutines,
          schedule: matchedSchedule,
          totalCount: matchedTasks.length + matchedRoutines.length + matchedSchedule.length,
        },
      });
    }

    return json({ error: "Endpoint not found" }, 404);
  } catch (err) {
    console.error("[API Error]:", err);
    return json({ error: "Internal Server Error" }, 500);
  }
};

export const config: Config = {
  path: "/api/*",
};
