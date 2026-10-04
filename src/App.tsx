import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  fetchProfile,
  updateProfile,
  fetchSchedule,
  createScheduleItem,
  deleteScheduleItem,
  fetchTasks,
  createTask,
  toggleTask,
  deleteTask,
  fetchRoutines,
  createRoutine,
  toggleRoutine,
  deleteRoutine,
  fetchChat,
  sendChatMessage,
  clearChat,
  logFocusSession,
  searchWorkspace,
  resetWorkspaceToFresh,
  StudentProfile,
  ClassScheduleItem,
  TaskItem,
  RoutineItem,
  ChatMessage,
} from "./api";

type IconName =
  | "home"
  | "calendar"
  | "check"
  | "sparkles"
  | "chart"
  | "search"
  | "bell"
  | "clock"
  | "book"
  | "arrow"
  | "plus"
  | "play"
  | "more"
  | "send"
  | "target"
  | "location"
  | "menu"
  | "close"
  | "trash"
  | "edit"
  | "upload"
  | "file"
  | "download";

function Icon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9" /><path d="M9 20v-6h6v6" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    check: <><path d="m7 12 3 3 7-7" /><rect x="3" y="3" width="18" height="18" rx="5" /></>,
    sparkles: <><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z" /><path d="m18.5 15 .7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1Z" /></>,
    chart: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    book: <><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5ZM20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z" /></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    play: <path d="m9 7 8 5-8 5V7Z" />,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
    send: <><path d="m22 2-8 20-4-8-8-4 20-8Z" /><path d="M10 14 22 2" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
    location: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    trash: <><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
    file: <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
  };
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

type Page = "overview" | "planner" | "tasks" | "tutor" | "progress";

const navItems: { id: Page; label: string; icon: IconName }[] = [
  { id: "overview", label: "Overview", icon: "home" },
  { id: "planner", label: "Routines", icon: "calendar" },
  { id: "tasks", label: "Assignments", icon: "check" },
  { id: "tutor", label: "AI tutor", icon: "sparkles" },
  { id: "progress", label: "Progress", icon: "chart" },
];

function App() {
  const [page, setPage] = useState<Page>("overview");
  const [profile, setProfile] = useState<StudentProfile>({
    name: "Aditya Nagonnavr",
    initials: "AK",
    major: "Computer Science",
    focusStreakDays: 6,
    weeklyGoalHours: 20,
    weeklyLoggedHours: 17,
    avatarColor: "bg-[#F0D8DE]",
    badgeColor: "text-[#741B2E]"
  });
  const [schedule, setSchedule] = useState<ClassScheduleItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [focusActive, setFocusActive] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Active Live Entry Modal: null | "task" | "class" | "routine" | "profile"
  const [activeModal, setActiveModal] = useState<null | "task" | "class" | "routine" | "profile">(null);

  // Live Forms State
  const [taskForm, setTaskForm] = useState({ title: "", course: "", due: "This week", priority: "Medium" as "High" | "Medium" | "Low" });
  const [classForm, setClassForm] = useState({ title: "", time: "10:00", period: "AM", room: "Room 101", courseCode: "" });
  const [routineForm, setRoutineForm] = useState({ title: "", time: "8:00 AM", detail: "", icon: "target" });
  const [profileForm, setProfileForm] = useState({ name: "", major: "", weeklyGoalHours: 20 });

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ tasks: TaskItem[]; routines: RoutineItem[]; schedule: ClassScheduleItem[]; totalCount: number } | null>(null);

  // Timezone & Dynamic Greeting state
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour >= 4 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 22) return "Good evening";
    return "Good night";
  }, [currentTime]);

  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [currentTime]);

  const formattedDate = useMemo(() => {
    return currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  }, [currentTime]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  // Initial load
  async function loadAllData() {
    const [prof, sched, tList, rList, cList] = await Promise.all([
      fetchProfile(),
      fetchSchedule(),
      fetchTasks(),
      fetchRoutines(),
      fetchChat(),
    ]);
    if (prof) {
      setProfile(prof);
      setProfileForm({ name: prof.name, major: prof.major, weeklyGoalHours: prof.weeklyGoalHours });
    }
    if (sched) setSchedule(sched);
    if (tList) setTasks(tList);
    if (rList) setRoutines(rList);
    if (cList) setChat(cList);
  }

  useEffect(() => {
    loadAllData();
  }, []);

  // Real-time search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await searchWorkspace(searchQuery);
      if (res) setSearchResults(res);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const completed = useMemo(() => tasks.filter((task) => task.done).length, [tasks]);

  function navigate(next: Page) {
    setPage(next);
    setMenuOpen(false);
    setSearchQuery("");
  }

  // --- Task actions ---
  async function handleToggleTask(id: number) {
    setTasks((current) => current.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
    await toggleTask(id);
  }

  async function handleCreateTaskSubmit(e: FormEvent) {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    const newTask = await createTask({
      title: taskForm.title.trim(),
      course: taskForm.course.trim() || "General",
      due: taskForm.due.trim() || "This week",
      priority: taskForm.priority,
    });
    if (newTask) {
      setTasks((curr) => [...curr, newTask]);
      setTaskForm({ title: "", course: "", due: "This week", priority: "Medium" });
      setActiveModal(null);
      showToast("Assignment added successfully!");
    }
  }

  async function handleDeleteTask(id: number) {
    const ok = await deleteTask(id);
    if (ok) {
      setTasks((curr) => curr.filter((t) => t.id !== id));
      showToast("Assignment deleted.");
    }
  }

  // --- Schedule actions ---
  async function handleCreateClassSubmit(e: FormEvent) {
    e.preventDefault();
    if (!classForm.title.trim()) return;
    const tones = [
      "bg-[#F3E1E6] text-[#8C3047]",
      "bg-[#F7E8EC] text-[#81283D]",
      "bg-[#FAE9ED] text-[#912C44]",
      "bg-[#F8ECEF] text-[#741B2E]",
    ];
    const newClass = await createScheduleItem({
      title: classForm.title.trim(),
      time: classForm.time.trim(),
      period: classForm.period,
      room: classForm.room.trim() || "Hall",
      courseCode: classForm.courseCode.trim(),
      tone: tones[schedule.length % tones.length],
      icon: (classForm.courseCode || classForm.title).slice(0, 2).toUpperCase(),
    });
    if (newClass) {
      setSchedule((curr) => [...curr, newClass]);
      setClassForm({ title: "", time: "10:00", period: "AM", room: "Room 101", courseCode: "" });
      setActiveModal(null);
      showToast("Class added to your daily schedule!");
    }
  }

  async function handleDeleteClass(id: string) {
    const ok = await deleteScheduleItem(id);
    if (ok) {
      setSchedule((curr) => curr.filter((c) => c.id !== id));
      showToast("Class removed from schedule.");
    }
  }

  // --- Routine actions ---
  async function handleCreateRoutineSubmit(e: FormEvent) {
    e.preventDefault();
    if (!routineForm.title.trim()) return;
    const newRoutine = await createRoutine({
      title: routineForm.title.trim(),
      time: routineForm.time.trim() || "Daily",
      detail: routineForm.detail.trim() || "Daily habit for energy and focus.",
      icon: routineForm.icon || "target",
      color: "bg-[#F8ECEF] text-[#741B2E]",
      added: true,
    });
    if (newRoutine) {
      setRoutines((curr) => [...curr, newRoutine]);
      setRoutineForm({ title: "", time: "8:00 AM", detail: "", icon: "target" });
      setActiveModal(null);
      showToast("Routine added to your daily planner!");
    }
  }

  async function handleToggleRoutine(id: string) {
    setRoutines((curr) => curr.map((r) => (r.id === id ? { ...r, added: !r.added } : r)));
    await toggleRoutine(id);
  }

  async function handleDeleteRoutine(id: string) {
    const ok = await deleteRoutine(id);
    if (ok) {
      setRoutines((curr) => curr.filter((r) => r.id !== id));
      showToast("Routine removed.");
    }
  }

  // --- Profile actions ---
  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    const updated = await updateProfile({
      name: profileForm.name.trim() || profile.name,
      major: profileForm.major.trim() || profile.major,
      weeklyGoalHours: Number(profileForm.weeklyGoalHours) || 20,
    });
    if (updated) {
      setProfile(updated);
      setActiveModal(null);
      showToast("Profile and goals updated!");
    }
  }

  async function handleStartFresh() {
    if (confirm("Are you sure you want to start fresh? This will remove sample demo classes, assignments, and routines so you can enter your own live data.")) {
      const ok = await resetWorkspaceToFresh();
      if (ok) {
        await loadAllData();
        setActiveModal(null);
        showToast("Workspace cleared! You now have a fresh slate.");
      }
    }
  }

  // --- Focus session ---
  async function handleStartFocusSession() {
    setFocusActive(true);
    showToast("Starting 50-minute focus session... Logging to backend!");
    const success = await logFocusSession(50, "Review session");
    if (success) {
      setProfile((prev) => ({
        ...prev,
        weeklyLoggedHours: Math.min(prev.weeklyGoalHours, Math.round((prev.weeklyLoggedHours + 50 / 60) * 10) / 10),
      }));
    }
  }

  // --- AI Tutor chat ---
  async function sendMessage(event?: FormEvent, customMessage?: string) {
    if (event) event.preventDefault();
    const value = (customMessage !== undefined ? customMessage : message).trim();
    if (!value || isAiThinking) return;

    const tempUserMsg: ChatMessage = { from: "user", text: value };
    setChat((current) => [...current, tempUserMsg]);
    if (!customMessage) setMessage("");
    setIsAiThinking(true);

    const courses = Array.from(new Set([
      ...schedule.map((s) => s.title),
      ...tasks.map((t) => t.course),
    ]));
    const pendingTasks = tasks.filter((t) => !t.done).map((t) => ({ title: t.title, course: t.course, due: t.due }));

    const res = await sendChatMessage(value, {
      studentName: profile.name,
      courses,
      tasks: pendingTasks,
    });
    if (res?.chat) {
      setChat(res.chat);
      if (res.updatedData) {
        if (res.updatedData.tasks) setTasks(res.updatedData.tasks);
        if (res.updatedData.routines) setRoutines(res.updatedData.routines);
        if (res.updatedData.schedule) setSchedule(res.updatedData.schedule);
        if (res.updatedData.profile) setProfile(res.updatedData.profile);
      }
      if (res.executedActions && res.executedActions.length > 0) {
        showToast(`AI updated workspace: ${res.executedActions.join(', ')}`);
      }
    } else {
      setChat((current) => [
        ...current,
        { from: "ai", text: "I can help with that. Let's break it into a clear explanation, an example, and a practice check." },
      ]);
    }
    setIsAiThinking(false);
  }

  async function handleClearChat() {
    if (confirm("Reset conversation with ContextAI Tutor?")) {
      const freshChat = await clearChat();
      if (freshChat) setChat(freshChat);
    }
  }

  const hoursRemaining = Math.max(0, profile.weeklyGoalHours - profile.weeklyLoggedHours);
  const goalPercent = Math.min(100, Math.round((profile.weeklyLoggedHours / profile.weeklyGoalHours) * 100));

  return (
    <main className="min-h-screen bg-[#F8F5F6] text-[#2F2024]">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 rounded-2xl bg-[#741B2E] px-5 py-3 text-sm font-bold text-white shadow-2xl animate-fade-in">
          {toast}
        </div>
      )}

      {/* MODAL: Add Assignment */}
      {activeModal === "task" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#E8DCE0] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8DCE0] pb-4">
              <h2 className="font-serif text-2xl text-[#3C1720]">Add New Assignment</h2>
              <button onClick={() => setActiveModal(null)} className="rounded-lg p-1 text-[#85877E] hover:bg-[#F8ECEF]">
                <Icon name="close" className="size-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTaskSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#71746C] uppercase mb-1">Assignment Title</label>
                <input
                  required
                  autoFocus
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Distributed Systems Final Paper"
                  className="w-full rounded-xl border border-[#E5D8DC] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#741B2E]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#71746C] uppercase mb-1">Course Code/Name</label>
                  <input
                    value={taskForm.course}
                    onChange={(e) => setTaskForm({ ...taskForm, course: e.target.value })}
                    placeholder="e.g. CS 304"
                    className="w-full rounded-xl border border-[#E5D8DC] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#741B2E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#71746C] uppercase mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                    className="w-full rounded-xl border border-[#E5D8DC] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#741B2E]"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#71746C] uppercase mb-1">Due Date / Time</label>
                <input
                  value={taskForm.due}
                  onChange={(e) => setTaskForm({ ...taskForm, due: e.target.value })}
                  placeholder="e.g. Tomorrow, 5:00 PM"
                  className="w-full rounded-xl border border-[#E5D8DC] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#741B2E]"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-[#E8DCE0]">
                <button type="button" onClick={() => setActiveModal(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#71746C] hover:bg-[#F8ECEF]">
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-[#741B2E] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#5C1425]">
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Class to Timetable */}
      {activeModal === "class" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#E8DCE0] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8DCE0] pb-4">
              <h2 className="font-serif text-2xl text-[#3C1720]">Add Class to Schedule</h2>
              <button onClick={() => setActiveModal(null)} className="rounded-lg p-1 text-[#85877E] hover:bg-[#F8ECEF]">
                <Icon name="close" className="size-5" />
              </button>
            </div>
            <form onSubmit={handleCreateClassSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#71746C] uppercase mb-1">Class / Subject Name</label>
                <input
                  required
                  autoFocus
                  value={classForm.title}
                  onChange={(e) => setClassForm({ ...classForm, title: e.target.value })}
                  placeholder="e.g. Operating Systems"
                  className="w-full rounded-xl border border-[#E5D8DC] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#741B2E]"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#71746C] uppercase mb-1">Time</label>
                  <input
                    value={classForm.time}
                    onChange={(e) => setClassForm({ ...classForm, time: e.target.value })}
                    placeholder="9:30"
                    className="w-full rounded-xl border border-[#E5D8DC] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#741B2E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#71746C] uppercase mb-1">Period</label>
                  <select
                    value={classForm.period}
                    onChange={(e) => setClassForm({ ...classForm, period: e.target.value })}
                    className="w-full rounded-xl border border-[#E5D8DC] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#741B2E]"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#71746C] uppercase mb-1">Room / Hall</label>
                  <input
                    value={classForm.room}
                    onChange={(e) => setClassForm({ ...classForm, room: e.target.value })}
                    placeholder="e.g. Room 302"
                    className="w-full rounded-xl border border-[#E5D8DC] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#741B2E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#71746C] uppercase mb-1">Course Code</label>
                  <input
                    value={classForm.courseCode}
                    onChange={(e) => setClassForm({ ...classForm, courseCode: e.target.value })}
                    placeholder="e.g. CS 210"
                    className="w-full rounded-xl border border-[#E5D8DC] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#741B2E]"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-[#E8DCE0]">
                <button type="button" onClick={() => setActiveModal(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#71746C] hover:bg-[#F8ECEF]">
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-[#741B2E] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#5C1425]">
                  Add Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Custom Routine */}
      {activeModal === "routine" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#E8DCE0] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8DCE0] pb-4">
              <h2 className="font-serif text-2xl text-[#3C1720]">Add Custom Routine</h2>
              <button onClick={() => setActiveModal(null)} className="rounded-lg p-1 text-[#85877E] hover:bg-[#F8ECEF]">
                <Icon name="close" className="size-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRoutineSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#71746C] uppercase mb-1">Routine Habit Title</label>
                <input
                  required
                  autoFocus
                  value={routineForm.title}
                  onChange={(e) => setRoutineForm({ ...routineForm, title: e.target.value })}
                  placeholder="e.g. Flashcards & Recall"
                  className="w-full rounded-xl border border-[#E5D8DC] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#741B2E]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#71746C] uppercase mb-1">Time</label>
                  <input
                    value={routineForm.time}
                    onChange={(e) => setRoutineForm({ ...routineForm, time: e.target.value })}
                    placeholder="e.g. 8:30 PM"
                    className="w-full rounded-xl border border-[#E5D8DC] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#741B2E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#71746C] uppercase mb-1">Icon Style</label>
                  <select
                    value={routineForm.icon}
                    onChange={(e) => setRoutineForm({ ...routineForm, icon: e.target.value })}
                    className="w-full rounded-xl border border-[#E5D8DC] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#741B2E]"
                  >
                    <option value="target">Target / Goal</option>
                    <option value="clock">Clock / Time</option>
                    <option value="book">Book / Study</option>
                    <option value="sparkles">Sparkles / AI</option>
                    <option value="check">Checkmark</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#71746C] uppercase mb-1">Details & Habit Goal</label>
                <textarea
                  rows={3}
                  value={routineForm.detail}
                  onChange={(e) => setRoutineForm({ ...routineForm, detail: e.target.value })}
                  placeholder="Brief description of what you do during this habit..."
                  className="w-full rounded-xl border border-[#E5D8DC] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#741B2E]"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-[#E8DCE0]">
                <button type="button" onClick={() => setActiveModal(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#71746C] hover:bg-[#F8ECEF]">
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-[#741B2E] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#5C1425]">
                  Save Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Profile & Start Fresh */}
      {activeModal === "profile" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#E8DCE0] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8DCE0] pb-4">
              <h2 className="font-serif text-2xl text-[#3C1720]">Edit Student Workspace</h2>
              <button onClick={() => setActiveModal(null)} className="rounded-lg p-1 text-[#85877E] hover:bg-[#F8ECEF]">
                <Icon name="close" className="size-5" />
              </button>
            </div>
            <form onSubmit={handleProfileSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#71746C] uppercase mb-1">Your Full Name</label>
                <input
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full rounded-xl border border-[#E5D8DC] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#741B2E]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#71746C] uppercase mb-1">Major / Degree</label>
                <input
                  value={profileForm.major}
                  onChange={(e) => setProfileForm({ ...profileForm, major: e.target.value })}
                  className="w-full rounded-xl border border-[#E5D8DC] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#741B2E]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#71746C] uppercase mb-1">Weekly Target Study Hours</label>
                <input
                  type="number"
                  min={1}
                  max={80}
                  value={profileForm.weeklyGoalHours}
                  onChange={(e) => setProfileForm({ ...profileForm, weeklyGoalHours: Number(e.target.value) })}
                  className="w-full rounded-xl border border-[#E5D8DC] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#741B2E]"
                />
              </div>

              {/* Start Fresh Button */}
              <div className="pt-4 border-t border-[#E8DCE0]">
                <p className="text-xs font-bold text-[#8B3A4D] uppercase">Live Data Control</p>
                <p className="text-xs text-[#85877E] mt-1">Want to start with zero demo tasks so you can enter everything live?</p>
                <button
                  type="button"
                  onClick={handleStartFresh}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#CFBEC3] py-2.5 text-xs font-bold text-[#741B2E] hover:bg-[#FBECEF]"
                >
                  <Icon name="trash" className="size-4" /> Clear Demo Data & Start Fresh
                </button>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-[#E8DCE0]">
                <button type="button" onClick={() => setActiveModal(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#71746C] hover:bg-[#F8ECEF]">
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-[#741B2E] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#5C1425]">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-[#E9DDE1] bg-[#FFFFFF] p-6 transition-transform lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between">
            <button className="flex items-center gap-3" onClick={() => navigate("overview")} aria-label="Go to overview">
              <span className="grid size-10 place-items-center rounded-2xl bg-[#741B2E] text-white"><Icon name="sparkles" /></span>
              <span className="text-left">
                <span className="block text-lg font-bold tracking-tight">ContextAI</span>
                <span className="block text-xs text-[#85877E]">Student workspace</span>
              </span>
            </button>
            <button className="rounded-xl p-2 text-[#777A72] lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Close menu"><Icon name="close" /></button>
          </div>

          <nav className="mt-10 space-y-1.5" aria-label="Main navigation">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => navigate(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${page === item.id ? "bg-[#741B2E] text-white shadow-sm" : "text-[#71746C] hover:bg-[#F5ECEF] hover:text-[#2F2024]"}`}>
                <Icon name={item.icon} className="size-[19px]" />{item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl bg-[#F8ECEF] p-4">
            <div className="mb-3 grid size-9 place-items-center rounded-xl bg-white text-[#741B2E]"><Icon name="target" className="size-5" /></div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">Weekly goal</p>
              <button onClick={() => setActiveModal("profile")} className="text-[10px] font-bold text-[#741B2E] hover:underline">Edit</button>
            </div>
            <p className="mt-1 text-xs leading-5 text-[#6F756F]">
              {hoursRemaining > 0 ? `You’re ${hoursRemaining} hours away from your ${profile.weeklyGoalHours}-hour goal.` : `You've achieved your weekly goal!`}
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-[#9B2941] transition-all duration-500" style={{ width: `${goalPercent}%` }} />
            </div>
            <p className="mt-2 text-[11px] font-bold text-[#7B5360]">{profile.weeklyLoggedHours} of {profile.weeklyGoalHours} hours</p>
          </div>

          {/* Student Profile Clickable for live edit */}
          <button onClick={() => setActiveModal("profile")} className="mt-5 flex items-center gap-3 border-t border-[#E9DDE1] pt-5 text-left hover:bg-[#F8ECEF] p-2 rounded-xl transition">
            <span className={`grid size-10 place-items-center rounded-full ${profile.avatarColor} text-sm font-bold ${profile.badgeColor}`}>
              {profile.initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">{profile.name}</span>
              <span className="block truncate text-xs text-[#85877E]">{profile.major}</span>
            </span>
            <Icon name="edit" className="size-4 text-[#85877E]" />
          </button>
        </div>
      </aside>

      {menuOpen && <button className="fixed inset-0 z-40 bg-black/25 lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}

      {/* Main Content View */}
      <section className="min-h-screen lg:ml-72">
        <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-[#E9DDE1]/80 bg-[#F8F5F6]/90 px-5 backdrop-blur-xl md:px-8 lg:px-10">
          <button className="rounded-xl border border-[#E5D8DC] bg-white p-2.5 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Icon name="menu" /></button>
          
          <div className="relative hidden max-w-md flex-1 sm:block">
            <label className="flex items-center gap-3 rounded-xl border border-[#E5D8DC] bg-white px-4 py-2.5 text-[#92958D] shadow-sm">
              <Icon name="search" className="size-4" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-[#2F2024] outline-none placeholder:text-[#999C94]"
                placeholder="Live search courses, tasks, or routines..."
              />
              {searchQuery ? (
                <button onClick={() => setSearchQuery("")} className="text-xs text-[#85877E] hover:text-[#741B2E]">✕</button>
              ) : (
                <kbd className="rounded-md bg-[#F6EFF1] px-2 py-1 text-[10px] font-semibold">⌘ K</kbd>
              )}
            </label>

            {/* Live Search dropdown */}
            {searchResults && searchResults.totalCount > 0 && (
              <div className="absolute left-0 right-0 top-12 z-50 max-h-80 overflow-y-auto rounded-2xl border border-[#E8DCE0] bg-white p-4 shadow-xl">
                <p className="mb-2 text-xs font-bold text-[#8B3A4D] uppercase">Results ({searchResults.totalCount})</p>
                {searchResults.tasks.map((t) => (
                  <div key={t.id} onClick={() => navigate("tasks")} className="cursor-pointer rounded-lg p-2 hover:bg-[#F8ECEF]">
                    <p className="text-xs font-bold">{t.title} <span className="text-[#85877E]">({t.course})</span></p>
                  </div>
                ))}
                {searchResults.routines.map((r) => (
                  <div key={r.id} onClick={() => navigate("planner")} className="cursor-pointer rounded-lg p-2 hover:bg-[#F8ECEF]">
                    <p className="text-xs font-bold">{r.title} <span className="text-[#85877E]">({r.time})</span></p>
                  </div>
                ))}
                {searchResults.schedule.map((s) => (
                  <div key={s.id} onClick={() => navigate("overview")} className="cursor-pointer rounded-lg p-2 hover:bg-[#F8ECEF]">
                    <p className="text-xs font-bold">{s.title} <span className="text-[#85877E]">({s.time} {s.period})</span></p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setActiveModal("task")}
              className="flex items-center gap-2 rounded-xl bg-[#741B2E] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#5C1425]"
            >
              <Icon name="plus" className="size-4" /> Live Entry
            </button>
            <div className="hidden items-center gap-2 rounded-full bg-[#F8ECEF] px-3 py-2 text-xs font-bold text-[#741B2E] md:flex">
              <span className="size-2 rounded-full bg-[#A33A51]" /> Streak: {profile.focusStreakDays} days
            </div>
            <button onClick={() => setActiveModal("profile")} className="relative grid size-10 place-items-center rounded-xl border border-[#E5D8DC] bg-white text-[#676A63]" title="Edit workspace profile">
              <Icon name="edit" className="size-4" />
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-5 py-7 pb-28 md:px-8 lg:px-10 lg:py-9">
          {page === "overview" && (
            <>
              <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F8ECEF] px-3 py-1 text-xs font-bold text-[#741B2E]">
                      <Icon name="clock" className="size-3.5" /> {formattedTime} · {formattedDate}
                    </span>
                  </div>
                  <h1 className="font-serif text-4xl tracking-tight text-[#3C1720] md:text-5xl">{greeting}, {profile.name.split(" ")[0]}.</h1>
                  <p className="mt-3 text-sm text-[#767A72]">Live workspace. Add your assignments, classes, and routines anytime.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setActiveModal("task")} className="flex items-center gap-2 rounded-xl bg-[#741B2E] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#5C1425]">
                    <Icon name="plus" className="size-4" /> + Add Assignment
                  </button>
                  <button onClick={() => setActiveModal("class")} className="flex items-center gap-2 rounded-xl border border-[#CFBEC3] bg-white px-5 py-3 text-sm font-bold text-[#741B2E] shadow-sm hover:bg-[#F8ECEF]">
                    <Icon name="calendar" className="size-4" /> + Add Class
                  </button>
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(310px,.75fr)]">
                <div className="min-w-0 space-y-5">
                  <section className="relative overflow-hidden rounded-[28px] bg-[#741B2E] p-6 text-white shadow-[0_18px_45px_rgba(38,78,64,.18)] md:p-8">
                    <div className="absolute -right-16 -top-24 size-64 rounded-full border-[38px] border-white/[.04]" />
                    <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
                      <div>
                        <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#E7BDC7]"><Icon name="sparkles" className="size-4" /> Smart focus session</div>
                        <h2 className="max-w-xl font-serif text-3xl leading-tight md:text-4xl">Your best focus window starts in 30 minutes.</h2>
                        <p className="mt-4 max-w-lg text-sm leading-6 text-[#F4DCE2]">Stay on top of your work. Click to log a 50-minute study session directly into your weekly goals.</p>
                        <div className="mt-6 flex flex-wrap gap-3">
                          <button onClick={handleStartFocusSession} className="flex items-center gap-2 rounded-xl bg-[#FFFFFF] px-4 py-3 text-sm font-bold text-[#741B2E] transition hover:bg-[#FBECEF]">
                            <Icon name="play" className="size-4" /> {focusActive ? "50m Session Logged!" : "Log 50m Focus"}
                          </button>
                          <button onClick={() => navigate("planner")} className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/15">View Routines</button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.07] p-4 backdrop-blur">
                        <div className="grid size-14 place-items-center rounded-full border-4 border-[#FFFFFF] text-base font-bold">50</div>
                        <div><p className="text-xs text-[#E7BDC7]">Suggested</p><p className="mt-1 text-sm font-bold">minutes of focus</p></div>
                      </div>
                    </div>
                  </section>

                  {/* Class Schedule Section */}
                  <section className="rounded-[24px] border border-[#E8DCE0] bg-[#FFFFFF] p-5 shadow-sm md:p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold">Today’s classes ({schedule.length})</h2>
                        <p className="mt-1 text-xs text-[#868981]">Your daily schedule</p>
                      </div>
                      <button onClick={() => setActiveModal("class")} className="flex items-center gap-1.5 text-xs font-bold text-[#741B2E] hover:underline">
                        <Icon name="plus" className="size-3.5" /> Add Class
                      </button>
                    </div>
                    {schedule.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#CFBEC3] p-8 text-center">
                        <p className="text-sm font-bold text-[#71746C]">No classes scheduled yet.</p>
                        <button onClick={() => setActiveModal("class")} className="mt-3 rounded-xl bg-[#741B2E] px-4 py-2 text-xs font-bold text-white">
                          + Add your first class
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#EEE3E6]">
                        {schedule.map((item) => (
                          <article key={item.id} className="group flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                            <div className="w-12 text-right">
                              <p className="text-sm font-extrabold">{item.time}</p>
                              <p className="text-[10px] font-bold text-[#9A9C96]">{item.period}</p>
                            </div>
                            <div className={`grid size-11 shrink-0 place-items-center rounded-xl text-xs font-extrabold ${item.tone}`}>{item.icon}</div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold">{item.title}</p>
                              <p className="mt-1 flex items-center gap-1 text-xs text-[#898C84]"><Icon name="location" className="size-3" />{item.room}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteClass(item.id)}
                              className="opacity-0 group-hover:opacity-100 text-[#85877E] hover:text-[#741B2E] transition p-1.5 rounded-lg"
                              title="Delete class"
                            >
                              <Icon name="trash" className="size-4" />
                            </button>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>
                </div>

                <div className="space-y-5">
                  {/* Assignments Section */}
                  <section className="rounded-[24px] border border-[#E8DCE0] bg-[#FFFFFF] p-5 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold">Assignments</h2>
                        <p className="mt-1 text-xs text-[#898C84]">{completed} of {tasks.length} completed</p>
                      </div>
                      <button onClick={() => navigate("tasks")} className="text-xs font-bold text-[#741B2E]">View all</button>
                    </div>
                    {tasks.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#CFBEC3] p-6 text-center">
                        <p className="text-xs text-[#71746C]">No assignments entered yet.</p>
                        <button onClick={() => setActiveModal("task")} className="mt-2 text-xs font-bold text-[#741B2E]">
                          + Add your first assignment
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tasks.map((task) => (
                          <div key={task.id} className="group flex items-start gap-3 rounded-xl p-3 transition hover:bg-[#F8F1F3]">
                            <button
                              onClick={() => handleToggleTask(task.id)}
                              className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 ${task.done ? "border-[#741B2E] bg-[#741B2E] text-white" : "border-[#CFBEC3]"}`}
                            >
                              <Icon name="check" className="size-3.5" />
                            </button>
                            <span className="min-w-0 flex-1 cursor-pointer" onClick={() => handleToggleTask(task.id)}>
                              <span className={`block text-sm font-bold ${task.done ? "text-[#9A9C96] line-through" : ""}`}>{task.title}</span>
                              <span className="mt-1 block text-[11px] text-[#8A8D85]">{task.course} · {task.due}</span>
                            </span>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="opacity-0 group-hover:opacity-100 text-[#85877E] hover:text-[#741B2E] transition p-1"
                              title="Delete task"
                            >
                              <Icon name="trash" className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button onClick={() => setActiveModal("task")} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#CFBEC3] py-3 text-xs font-bold text-[#70736B] hover:border-[#741B2E] hover:text-[#741B2E]">
                      <Icon name="plus" className="size-4" /> Add assignment
                    </button>
                  </section>

                  {/* AI Insight Card */}
                  <section className="rounded-[24px] bg-[#F5E2E7] p-5">
                    <div className="flex items-start justify-between">
                      <span className="grid size-10 place-items-center rounded-xl bg-white/60 text-[#8D3046]"><Icon name="sparkles" /></span>
                      <span className="rounded-full bg-white/50 px-2.5 py-1 text-[10px] font-bold text-[#7D2A3D]">AI insight</span>
                    </div>
                    <h2 className="mt-5 font-serif text-2xl leading-tight text-[#561727]">Revise topics within 24 hours to maximize retention.</h2>
                    <p className="mt-3 text-xs leading-5 text-[#865062]">Short 15-minute recall blocks right after your classes increase long-term memory by up to 40%.</p>
                    <button onClick={() => navigate("tutor")} className="mt-5 flex items-center gap-2 text-xs font-extrabold text-[#741B2E]">
                      Ask AI Tutor for guidance <Icon name="arrow" className="size-4" />
                    </button>
                  </section>
                </div>
              </div>
            </>
          )}

          {page === "planner" && (
            <Planner
              routines={routines}
              onToggleRoutine={handleToggleRoutine}
              onDeleteRoutine={handleDeleteRoutine}
              onOpenAddRoutine={() => setActiveModal("routine")}
            />
          )}

          {page === "tasks" && (
            <TaskPage
              tasks={tasks}
              onToggle={handleToggleTask}
              onOpenAdd={() => setActiveModal("task")}
              onDelete={handleDeleteTask}
            />
          )}

          {page === "tutor" && (
            <Tutor
              chat={chat}
              message={message}
              setMessage={setMessage}
              sendMessage={sendMessage}
              onClear={handleClearChat}
              isThinking={isAiThinking}
            />
          )}

          {page === "progress" && <Progress tasks={tasks} profile={profile} />}
        </div>
      </section>

      {/* Mobile Nav */}
      <nav className="fixed inset-x-3 bottom-3 z-40 flex justify-around rounded-2xl border border-[#E4D6DA] bg-[#FFFFFF]/95 p-2 shadow-xl backdrop-blur lg:hidden" aria-label="Mobile navigation">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => navigate(item.id)} className={`flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[9px] font-bold ${page === item.id ? "bg-[#741B2E] text-white" : "text-[#777A72]"}`}>
            <Icon name={item.icon} className="size-[18px]" />
            <span className="max-w-14 truncate">{item.label.split(" ")[0]}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}

function PageHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="mb-8">
      <p className="mb-2 text-sm font-bold text-[#8B3A4D]">{eyebrow}</p>
      <h1 className="font-serif text-4xl text-[#3C1720] md:text-5xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#767A72]">{body}</p>
    </div>
  );
}

function Planner({
  routines,
  onToggleRoutine,
  onDeleteRoutine,
  onOpenAddRoutine,
}: {
  routines: RoutineItem[];
  onToggleRoutine: (id: string) => void;
  onDeleteRoutine: (id: string) => void;
  onOpenAddRoutine: () => void;
}) {
  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <PageHeading eyebrow="Daily routines" title="Build habits that support learning." body="Add and customize your daily learning habits live. Everything is saved to your backend." />
        <button onClick={onOpenAddRoutine} className="flex items-center gap-2 rounded-xl bg-[#741B2E] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#5C1425]">
          <Icon name="plus" className="size-4" /> + Create Custom Routine
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {routines.map((routine) => (
          <article key={routine.id} className="group relative rounded-[24px] border border-[#E8DCE0] bg-[#FFFFFF] p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <span className={`grid size-11 place-items-center rounded-xl ${routine.color}`}><Icon name={routine.icon as IconName} /></span>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#F7F0F2] px-3 py-1.5 text-[10px] font-bold text-[#6F746C]">{routine.time}</span>
                <button onClick={() => onDeleteRoutine(routine.id)} className="opacity-0 group-hover:opacity-100 text-[#85877E] hover:text-[#741B2E] transition p-1" title="Delete routine">
                  <Icon name="trash" className="size-3.5" />
                </button>
              </div>
            </div>
            <h2 className="mt-5 text-lg font-bold">{routine.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#777B73]">{routine.detail}</p>
            <button
              onClick={() => onToggleRoutine(routine.id)}
              className={`mt-5 flex items-center gap-2 text-xs font-extrabold ${routine.added ? "text-[#3C1720] opacity-80" : "text-[#741B2E]"}`}
            >
              <Icon name={routine.added ? "check" : "plus"} className="size-4" />
              {routine.added ? "Added to my routine ✓" : "Add to my routine"}
            </button>
          </article>
        ))}
      </div>

      <section className="mt-5 flex flex-col justify-between gap-5 rounded-[24px] bg-[#741B2E] p-6 text-white md:flex-row md:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#E7BDC7]">Consistency Principle</p>
          <h2 className="mt-2 font-serif text-2xl">Consistency beats a perfect schedule.</h2>
          <p className="mt-2 text-sm text-[#F4DCE2]">Choose two routines first. Stick with them for a week before adding more.</p>
        </div>
        <button onClick={onOpenAddRoutine} className="shrink-0 rounded-xl bg-[#FFFFFF] px-5 py-3 text-sm font-bold text-[#741B2E]">
          + Add New Routine
        </button>
      </section>
    </>
  );
}

function TaskPage({
  tasks,
  onToggle,
  onOpenAdd,
  onDelete,
}: {
  tasks: TaskItem[];
  onToggle: (id: number) => void;
  onOpenAdd: () => void;
  onDelete: (id: number) => void;
}) {
  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <PageHeading eyebrow="Assignments" title="Finish what matters." body="Track and organize all your coursework. Add tasks live, check them off, or remove finished items." />
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => {
              const headers = "ID,Title,Course,Due,Priority,Status\n";
              const rows = tasks.map(t => `"${t.id}","${t.title.replace(/"/g, '""')}","${t.course}","${t.due}","${t.priority}","${t.done ? "Completed" : "Pending"}"`).join("\n");
              const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", `assignments_${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-2 rounded-xl border border-[#CFBEC3] bg-white px-4 py-3 text-sm font-bold text-[#741B2E] shadow-xs hover:bg-[#F8ECEF]"
            title="Download CSV export of assignments"
          >
            <Icon name="download" className="size-4" /> Export CSV
          </button>
          <button onClick={onOpenAdd} className="flex items-center gap-2 rounded-xl bg-[#741B2E] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#5C1425]">
            <Icon name="plus" className="size-4" /> + Add Assignment
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {(["High", "Medium", "Low"] as const).map((priority) => (
          <section key={priority} className="rounded-[24px] border border-[#E8DCE0] bg-[#FFFFFF] p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-bold">{priority} priority</h2>
              <span className="rounded-full bg-[#F7F0F2] px-2.5 py-1 text-[10px] font-bold">{tasks.filter((t) => t.priority === priority).length}</span>
            </div>
            <div className="space-y-3">
              {tasks
                .filter((t) => t.priority === priority)
                .map((task) => (
                  <div key={task.id} className="group relative flex items-start gap-3 rounded-2xl border border-[#EADFE2] bg-white p-4 text-left shadow-sm">
                    <button
                      onClick={() => onToggle(task.id)}
                      className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border ${task.done ? "border-[#741B2E] bg-[#741B2E] text-white" : "border-[#CEBBC1]"}`}
                    >
                      <Icon name="check" className="size-3" />
                    </button>
                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onToggle(task.id)}>
                      <span className={`block text-sm font-bold ${task.done ? "text-[#9A9C96] line-through" : ""}`}>{task.title}</span>
                      <span className="mt-2 block text-[11px] text-[#8A8D85]">{task.course} · {task.due}</span>
                    </div>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-[#85877E] hover:text-[#741B2E] transition p-1"
                      title="Delete assignment"
                    >
                      <Icon name="trash" className="size-4" />
                    </button>
                  </div>
                ))}
              {tasks.filter((t) => t.priority === priority).length === 0 && (
                <p className="text-xs text-[#85877E] italic py-2">No {priority.toLowerCase()} priority tasks.</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

function Tutor({
  chat,
  message,
  setMessage,
  sendMessage,
  onClear,
  isThinking,
}: {
  chat: ChatMessage[];
  message: string;
  setMessage: (v: string) => void;
  sendMessage: (e?: FormEvent, customMessage?: string) => void;
  onClear: () => void;
  isThinking: boolean;
}) {
  const [uploadedFile, setUploadedFile] = useState<{ name: string; content: string } | null>(null);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setUploadedFile({ name: file.name, content: text });
    };
    reader.readAsText(file);
  }

  function handleSendWithUpload(e: FormEvent) {
    e.preventDefault();
    if (uploadedFile) {
      const combined = `[Uploaded Document: "${uploadedFile.name}"]\n${uploadedFile.content.slice(0, 4000)}\n\nStudent Request: ${message.trim() || "Please analyze this document, extract key topics, and add necessary study assignments or classes to my workspace."}`;
      sendMessage(undefined, combined);
      setUploadedFile(null);
    } else {
      sendMessage(e);
    }
  }

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <PageHeading eyebrow="AI tutor & workspace assistant" title="Learn by asking & automate tasks." body="Ask questions, upload study materials/syllabi, or tell the AI to add assignments, schedule classes, and adjust routines." />
        <button onClick={onClear} className="text-xs font-bold text-[#8B3A4D] hover:underline">
          Reset Conversation
        </button>
      </div>

      {/* Quick Action Suggestion Chips */}
      <div className="mx-auto mb-4 flex max-w-4xl flex-wrap gap-2">
        <button
          onClick={() => sendMessage(undefined, "Add assignment: Algorithms Problem Set 4 for CS 201 due Friday with High priority")}
          className="rounded-xl border border-[#E5D8DC] bg-white px-3 py-1.5 text-xs font-semibold text-[#741B2E] transition hover:bg-[#F8ECEF]"
        >
          ⚡ "+ Add Algorithms Assignment"
        </button>
        <button
          onClick={() => sendMessage(undefined, "Create routine: 30-minute active recall study session at 8:00 PM")}
          className="rounded-xl border border-[#E5D8DC] bg-white px-3 py-1.5 text-xs font-semibold text-[#741B2E] transition hover:bg-[#F8ECEF]"
        >
          ⚡ "+ Add 8 PM Recall Routine"
        </button>
        <button
          onClick={() => sendMessage(undefined, "Add class: Machine Learning at 11:00 AM in Studio 2 for CS 410")}
          className="rounded-xl border border-[#E5D8DC] bg-white px-3 py-1.5 text-xs font-semibold text-[#741B2E] transition hover:bg-[#F8ECEF]"
        >
          ⚡ "+ Schedule ML Class"
        </button>
        <button
          onClick={() => sendMessage(undefined, "Please create a balanced study plan for my pending assignments today")}
          className="rounded-xl border border-[#E5D8DC] bg-white px-3 py-1.5 text-xs font-semibold text-[#741B2E] transition hover:bg-[#F8ECEF]"
        >
          🎯 "Create Study Plan"
        </button>
      </div>

      <section className="mx-auto max-w-4xl overflow-hidden rounded-[28px] border border-[#E8DCE0] bg-[#FFFFFF] shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E8DCE0] p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#741B2E] text-white"><Icon name="sparkles" /></span>
            <div>
              <p className="text-sm font-bold">ContextAI Tutor & Workspace Agent</p>
              <p className="text-xs text-[#85877E]">Ask questions, upload documents, or modify your workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#EBF7EE] px-3 py-1.5 text-xs font-bold text-[#1F6E36]">
            <span className="size-2 rounded-full bg-[#2FA64E] animate-pulse" />
            Connected to Gemini
          </div>
        </div>

        <div className="flex min-h-[420px] max-h-[550px] overflow-y-auto flex-col gap-4 p-5 md:p-8">
          {chat.map((item, i) => (
            <div
              key={item.id || i}
              className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6 ${
                item.from === "user" ? "ml-auto rounded-br-md bg-[#741B2E] text-white" : "rounded-bl-md bg-[#F6EDF0] text-[#4B363C]"
              }`}
            >
              {item.text}
            </div>
          ))}
          {isThinking && (
            <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-[#F6EDF0] px-4 py-3 text-xs italic text-[#741B2E]">
              ContextAI Tutor is thinking & updating your workspace...
            </div>
          )}
        </div>

        {/* Uploaded Document Banner */}
        {uploadedFile && (
          <div className="flex items-center justify-between border-t border-[#F0E4E8] bg-[#FDF7F8] px-5 py-2.5 text-xs text-[#741B2E]">
            <span className="flex items-center gap-2 font-bold">
              <Icon name="file" className="size-4" /> Attached: {uploadedFile.name} (Ready to analyze & add items)
            </span>
            <button
              onClick={() => setUploadedFile(null)}
              className="text-[#85877E] hover:text-[#741B2E]"
            >
              <Icon name="close" className="size-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSendWithUpload} className="flex items-center gap-2 border-t border-[#E8DCE0] p-4">
          <label className="cursor-pointer rounded-xl border border-[#E4D7DB] p-2.5 text-[#741B2E] transition hover:bg-[#F8ECEF]" title="Upload document, syllabus, or notes to AI Tutor">
            <input
              type="file"
              accept=".txt,.md,.json,.csv,.js,.ts,.html,.css"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Icon name="upload" className="size-5" />
          </label>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isThinking}
            className="min-w-0 flex-1 rounded-xl border border-[#E4D7DB] bg-white px-4 py-3 text-sm outline-none focus:border-[#741B2E]"
            placeholder={uploadedFile ? "Tell AI Tutor what to do with this document (e.g. 'Extract my assignments')..." : "Ask a concept or tell AI: 'Add task: Final Project due Friday'..."}
          />
          <button
            type="submit"
            disabled={isThinking}
            className="grid size-11 place-items-center rounded-xl bg-[#741B2E] text-white disabled:opacity-50"
            aria-label="Send message"
          >
            <Icon name="send" className="size-[18px]" />
          </button>
        </form>
      </section>
    </>
  );
}

function Progress({ tasks, profile }: { tasks: TaskItem[]; profile: StudentProfile }) {
  const completedTasks = tasks.filter((task) => task.done);
  const completion = tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <>
      <PageHeading eyebrow="Task progress" title="Progress you have earned." body="Your progress updates dynamically from your live tasks." />
      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-[24px] bg-[#741B2E] p-6 text-white">
          <p className="text-xs font-bold text-[#E7BDC7]">COMPLETION RATE</p>
          <p className="mt-4 font-serif text-5xl">{completion}%</p>
          <p className="mt-3 text-xs text-[#F4DCE2]">Calculated from active tasks</p>
        </div>
        <div className="rounded-[24px] border border-[#E8DCE0] bg-[#FFFFFF] p-6">
          <p className="text-xs font-bold text-[#85877E]">TASKS COMPLETED</p>
          <p className="mt-4 font-serif text-5xl">{completedTasks.length}</p>
          <p className="mt-3 text-xs text-[#767A72]">Out of {tasks.length} total tasks</p>
        </div>
        <div className="rounded-[24px] bg-[#F5E2E7] p-6">
          <p className="text-xs font-bold text-[#7D2A3D]">STUDY HOURS LOGGED</p>
          <p className="mt-4 font-serif text-5xl text-[#561727]">{profile.weeklyLoggedHours}h</p>
          <p className="mt-3 text-xs text-[#865062]">Goal: {profile.weeklyGoalHours}h this week</p>
        </div>
      </div>

      {/* Interactive Visual Pictographs Section */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Pictograph 1: Course Task Distribution */}
        <section className="rounded-[24px] border border-[#E8DCE0] bg-[#FFFFFF] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Course Task Pictograph</h2>
              <p className="mt-1 text-xs text-[#85877E]">Visual icon distribution per course</p>
            </div>
            <span className="rounded-full bg-[#F8ECEF] px-3 py-1 text-xs font-bold text-[#741B2E]">
              1 icon = 1 assignment
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {Array.from(new Set(tasks.map(t => t.course || "General"))).length === 0 ? (
              <p className="py-6 text-center text-xs italic text-[#85877E]">No assignments entered yet. Add assignments to visualize your course pictograph!</p>
            ) : (
              Array.from(new Set(tasks.map(t => t.course || "General"))).map((courseName) => {
                const courseTasks = tasks.filter(t => (t.course || "General") === courseName);
                const doneCount = courseTasks.filter(t => t.done).length;
                const pendingCount = courseTasks.length - doneCount;

                return (
                  <div key={courseName} className="rounded-2xl border border-[#F0E4E8] bg-[#FAF6F7] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#3C1720]">{courseName}</span>
                      <span className="text-xs font-extrabold text-[#741B2E]">
                        {doneCount} / {courseTasks.length} Done ({Math.round((doneCount / courseTasks.length) * 100)}%)
                      </span>
                    </div>

                    {/* Pictograph row of icons */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {courseTasks.map((t, idx) => (
                        <div
                          key={t.id || idx}
                          title={`${t.title}: ${t.done ? "Completed" : "Pending"}`}
                          className={`flex items-center justify-center rounded-lg p-1.5 transition-transform hover:scale-110 ${
                            t.done
                              ? "bg-[#741B2E] text-white shadow-xs"
                              : "border border-[#CEBBC1] bg-white text-[#85877E]"
                          }`}
                        >
                          <Icon name={t.done ? "check" : "book"} className="size-4" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-5 flex items-center gap-4 border-t border-[#F0E4E8] pt-3 text-[11px] text-[#85877E]">
            <span className="flex items-center gap-1.5">
              <span className="grid size-4 place-items-center rounded bg-[#741B2E] text-white">
                <Icon name="check" className="size-2.5" />
              </span>
              Completed Task
            </span>
            <span className="flex items-center gap-1.5">
              <span className="grid size-4 place-items-center rounded border border-[#CEBBC1] bg-white text-[#85877E]">
                <Icon name="book" className="size-2.5" />
              </span>
              Pending Task
            </span>
          </div>
        </section>

        {/* Pictograph 2: Weekly Study Focus Matrix */}
        <section className="rounded-[24px] border border-[#E8DCE0] bg-[#FFFFFF] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Weekly Study Hours Pictograph</h2>
              <p className="mt-1 text-xs text-[#85877E]">Target vs Logged Focus blocks</p>
            </div>
            <span className="rounded-full bg-[#F5E2E7] px-3 py-1 text-xs font-bold text-[#7D2A3D]">
              1 block = 2 hours
            </span>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-xs font-bold text-[#71746C]">
              <span>Progress towards weekly goal ({profile.weeklyGoalHours}h)</span>
              <span className="text-[#741B2E]">{profile.weeklyLoggedHours} hours logged</span>
            </div>

            {/* Pictograph Grid */}
            <div className="mt-4 grid grid-cols-5 gap-2.5 sm:grid-cols-10">
              {Array.from({ length: Math.ceil(profile.weeklyGoalHours / 2) }).map((_, i) => {
                const loggedBlocks = Math.floor(profile.weeklyLoggedHours / 2);
                const isLogged = i < loggedBlocks;
                const isPartial = !isLogged && i === loggedBlocks && (profile.weeklyLoggedHours % 2 > 0);

                return (
                  <div
                    key={i}
                    title={`Block ${i + 1} (${(i + 1) * 2}h mark): ${isLogged ? "Completed" : isPartial ? "Partially logged" : "Goal remaining"}`}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2.5 text-center transition ${
                      isLogged
                        ? "bg-[#741B2E] text-white shadow-sm"
                        : isPartial
                        ? "border-2 border-[#741B2E] bg-[#FBECEF] text-[#741B2E]"
                        : "border border-dashed border-[#CFBEC3] bg-[#FAF6F7] text-[#9A9C96]"
                    }`}
                  >
                    <Icon name="clock" className="size-4" />
                    <span className="text-[10px] font-bold">{(i + 1) * 2}h</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-[#F8ECEF] p-4 text-xs text-[#741B2E]">
            <p className="font-bold">Consistency Streak: {profile.focusStreakDays} Consecutive Days 🔥</p>
            <p className="mt-1 text-[#8A4C5B]">You are {Math.max(0, profile.weeklyGoalHours - profile.weeklyLoggedHours)} hours away from hitting this week’s academic target.</p>
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-[24px] border border-[#E8DCE0] bg-[#FFFFFF] p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Assignment progress</h2>
            <p className="mt-1 text-xs text-[#85877E]">Each completed task contributes equally</p>
          </div>
          <p className="text-sm font-extrabold text-[#741B2E]">{completedTasks.length}/{tasks.length}</p>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#EBDDE1]">
          <div className="h-full rounded-full bg-[#9B2941] transition-all duration-500" style={{ width: `${completion}%` }} />
        </div>
        <div className="mt-7 space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 rounded-xl border border-[#EBE0E3] bg-white p-4">
              <span className={`grid size-7 place-items-center rounded-lg ${task.done ? "bg-[#741B2E] text-white" : "bg-[#F7F0F2] text-[#A0A29C]"}`}>
                <Icon name="check" className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-bold ${task.done ? "text-[#74786F] line-through" : ""}`}>{task.title}</p>
                <p className="mt-0.5 text-[11px] text-[#93968E]">{task.course} · {task.due}</p>
              </div>
              <span className={`text-[10px] font-bold ${task.done ? "text-[#741B2E]" : "text-[#9A9D95]"}`}>
                {task.done ? "Completed" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default App;
