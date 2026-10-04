import fs from 'node:fs';
import path from 'node:path';

export interface StudentProfile {
  name: string;
  initials: string;
  major: string;
  focusStreakDays: number;
  weeklyGoalHours: number;
  weeklyLoggedHours: number;
  avatarColor: string;
  badgeColor: string;
}

export interface ClassScheduleItem {
  id: string;
  time: string;
  period: string;
  title: string;
  room: string;
  tone: string;
  icon: string;
  courseCode?: string;
}

export interface TaskItem {
  id: number;
  title: string;
  course: string;
  due: string;
  done: boolean;
  priority: 'High' | 'Medium' | 'Low';
  createdAt?: string;
  completedAt?: string;
}

export interface RoutineItem {
  id: string;
  time: string;
  title: string;
  detail: string;
  icon: string;
  color: string;
  added?: boolean;
}

export interface ChatMessage {
  id: string;
  from: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export interface FocusSession {
  id: string;
  durationMinutes: number;
  topic?: string;
  timestamp: string;
}

export interface DatabaseSchema {
  profile: StudentProfile;
  schedule: ClassScheduleItem[];
  tasks: TaskItem[];
  routines: RoutineItem[];
  chat: ChatMessage[];
  focusSessions: FocusSession[];
}

const defaultData: DatabaseSchema = {
  profile: {
    name: "Aditya Nagonnavr",
    initials: "AK",
    major: "Computer Science",
    focusStreakDays: 6,
    weeklyGoalHours: 20,
    weeklyLoggedHours: 17,
    avatarColor: "bg-[#F0D8DE]",
    badgeColor: "text-[#741B2E]"
  },
  schedule: [
    { id: "1", time: "9:00", period: "AM", title: "Data Structures", room: "Room 204", tone: "bg-[#F3E1E6] text-[#8C3047]", icon: "DS", courseCode: "CS 201" },
    { id: "2", time: "11:30", period: "AM", title: "Design Thinking", room: "Studio 3", tone: "bg-[#F7E8EC] text-[#81283D]", icon: "DT", courseCode: "DES 210" },
    { id: "3", time: "2:30", period: "PM", title: "Project Lab", room: "Innovation Hub", tone: "bg-[#FAE9ED] text-[#912C44]", icon: "PL", courseCode: "CS 304" },
  ],
  tasks: [
    { id: 1, title: "Database systems quiz", course: "CS 304", due: "Today, 5:00 PM", done: false, priority: "High", createdAt: new Date().toISOString() },
    { id: 2, title: "Submit UX case study", course: "DES 210", due: "Tomorrow", done: false, priority: "Medium", createdAt: new Date().toISOString() },
    { id: 3, title: "Review graph algorithms", course: "CS 201", due: "Friday", done: true, priority: "Low", createdAt: new Date().toISOString(), completedAt: new Date().toISOString() },
  ],
  routines: [
    { id: "1", time: "6:30 AM", title: "Wake up & hydrate", detail: "Start with a glass of water and five minutes of sunlight.", icon: "clock", color: "bg-[#F8ECEF] text-[#741B2E]", added: true },
    { id: "2", time: "7:00 AM", title: "Move for 20 minutes", detail: "Walk, stretch, or do light exercise before sitting down to study.", icon: "target", color: "bg-[#FAE9ED] text-[#912C44]", added: true },
    { id: "3", time: "8:00 AM", title: "Plan the top three", detail: "Choose three realistic priorities for classes and assignments.", icon: "check", color: "bg-[#F3E1E6] text-[#8C3047]", added: true },
    { id: "4", time: "4:30 PM", title: "Focused revision", detail: "Review one difficult topic for 45 minutes without notifications.", icon: "book", color: "bg-[#F7E8EC] text-[#81283D]", added: false },
    { id: "5", time: "7:30 PM", title: "Quick recall practice", detail: "Close your notes and write down what you remember for 15 minutes.", icon: "sparkles", color: "bg-[#F5E2E7] text-[#7D2A3D]", added: false },
    { id: "6", time: "10:30 PM", title: "Digital wind-down", detail: "Put screens away, prepare for tomorrow, and aim for 7–8 hours of sleep.", icon: "clock", color: "bg-[#F5EFF1] text-[#795A63]", added: false },
  ],
  chat: [
    { id: "1", from: "ai", text: "Hi Aditya. What would you like to understand better today?", timestamp: new Date().toISOString() }
  ],
  focusSessions: [
    { id: "1", durationMinutes: 50, topic: "Graph Algorithms", timestamp: new Date().toISOString() }
  ]
};

const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'data') : path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'workspace_db.json');

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    // If running on Vercel /tmp, seed from project data if available
    const rootDbFile = path.resolve(process.cwd(), 'data', 'workspace_db.json');
    if (fs.existsSync(rootDbFile)) {
      try {
        fs.copyFileSync(rootDbFile, DB_FILE);
        return;
      } catch {}
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

export function readDb(): DatabaseSchema {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch (err) {
    console.error("Error reading database, resetting to default:", err);
    writeDb(defaultData);
    return defaultData;
  }
}

export function writeDb(data: DatabaseSchema): void {
  ensureDataFile();
  const tempPath = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_FILE);
}
