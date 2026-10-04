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
  id?: string;
  from: 'ai' | 'user';
  text: string;
  timestamp?: string;
}

export interface ProgressSummary {
  completionRate: number;
  completedTasks: number;
  remainingTasks: number;
  totalTasks: number;
  weeklyGoalHours: number;
  weeklyLoggedHours: number;
  focusStreakDays: number;
  totalFocusMinutes: number;
}

const API_BASE = '/api';

export async function fetchProfile(): Promise<StudentProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/profile`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.profile;
  } catch {
    return null;
  }
}

export async function fetchSchedule(): Promise<ClassScheduleItem[]> {
  try {
    const res = await fetch(`${API_BASE}/schedule`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.schedule || [];
  } catch {
    return [];
  }
}

export async function fetchTasks(): Promise<TaskItem[]> {
  try {
    const res = await fetch(`${API_BASE}/tasks`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.tasks || [];
  } catch {
    return [];
  }
}

export async function createTask(task: Partial<TaskItem>): Promise<TaskItem | null> {
  try {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.task;
  } catch {
    return null;
  }
}

export async function toggleTask(id: number): Promise<TaskItem | null> {
  try {
    const res = await fetch(`${API_BASE}/tasks/${id}/toggle`, {
      method: 'PATCH',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.task;
  } catch {
    return null;
  }
}

export async function deleteTask(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchRoutines(): Promise<RoutineItem[]> {
  try {
    const res = await fetch(`${API_BASE}/routines`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.routines || [];
  } catch {
    return [];
  }
}

export async function toggleRoutine(id: string): Promise<RoutineItem | null> {
  try {
    const res = await fetch(`${API_BASE}/routines/${id}/toggle`, {
      method: 'PATCH',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.routine;
  } catch {
    return null;
  }
}

export async function fetchChat(): Promise<ChatMessage[]> {
  try {
    const res = await fetch(`${API_BASE}/tutor`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.chat || [];
  } catch {
    return [];
  }
}

export interface SendChatResponse {
  aiMessage: ChatMessage;
  chat: ChatMessage[];
  executedActions?: string[];
  updatedData?: {
    tasks?: TaskItem[];
    routines?: RoutineItem[];
    schedule?: ClassScheduleItem[];
    profile?: StudentProfile;
  };
}

export async function sendChatMessage(
  message: string,
  context?: { studentName?: string; courses?: string[]; tasks?: { title: string; course: string; due: string }[] }
): Promise<SendChatResponse | null> {
  // First try local backend API
  try {
    const res = await fetch(`${API_BASE}/tutor/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Backend fetch failed or backend is offline, fall through to direct Gemini call
  }

  // Fallback: Direct Gemini API call using Vite environment variable
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  if (apiKey) {
    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.5-flash'];
    const studentName = context?.studentName || 'Student';
    const coursesText = context?.courses?.length ? context.courses.join(', ') : 'General Studies';
    const tasksText = context?.tasks?.length ? context.tasks.map(t => `${t.title} (${t.course}, due: ${t.due})`).join('; ') : 'None';

    for (const model of candidateModels) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `You are ContextAI Tutor, an encouraging, clear, and pedagogical AI tutor for college student ${studentName}.
Current courses: ${coursesText}.
Pending assignments: ${tasksText}.

Student's Question: "${message}"

Instructions:
- Provide an easy-to-understand explanation.
- Structure with: (1) Core Concept, (2) Concrete Example/Code, and (3) Practice check or tip.
- Keep the response encouraging, structured, and easy to read.`
                    }
                  ]
                }
              ]
            })
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            const aiMsg: ChatMessage = {
              id: `msg_${Date.now()}_ai`,
              from: 'ai',
              text: replyText.trim(),
              timestamp: new Date().toISOString()
            };
            return {
              aiMessage: aiMsg,
              chat: [
                { id: `msg_${Date.now()}_u`, from: 'user', text: message, timestamp: new Date().toISOString() },
                aiMsg
              ]
            };
          }
        }
      } catch (e) {
        console.warn(`Direct Gemini call with ${model} error:`, e);
      }
    }
  }

  return null;
}

export async function clearChat(): Promise<ChatMessage[]> {
  try {
    const res = await fetch(`${API_BASE}/tutor/clear`, {
      method: 'DELETE',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.chat || [];
  } catch {
    return [];
  }
}

export async function fetchProgress(): Promise<ProgressSummary | null> {
  try {
    const res = await fetch(`${API_BASE}/progress`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.summary;
  } catch {
    return null;
  }
}

export async function logFocusSession(durationMinutes: number = 50, topic?: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/progress/focus-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ durationMinutes, topic }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function updateProfile(data: Partial<StudentProfile>): Promise<StudentProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body.profile;
  } catch {
    return null;
  }
}

export async function createScheduleItem(item: Partial<ClassScheduleItem>): Promise<ClassScheduleItem | null> {
  try {
    const res = await fetch(`${API_BASE}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.class;
  } catch {
    return null;
  }
}

export async function deleteScheduleItem(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/schedule/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function createRoutine(routine: Partial<RoutineItem>): Promise<RoutineItem | null> {
  try {
    const res = await fetch(`${API_BASE}/routines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(routine),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.routine;
  } catch {
    return null;
  }
}

export async function deleteRoutine(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/routines/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function resetWorkspaceToFresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/profile/fresh`, {
      method: 'POST',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function searchWorkspace(q: string) {
  try {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.results;
  } catch {
    return null;
  }
}

