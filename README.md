# ContextAI — Student Workspace (Full Stack)

A complete, persistent student workspace for assignments, daily routines, AI tutoring, and task-based progress.

---

## 🏛 Architecture Overview

ContextAI is built with a decoupled client-server architecture:

```
[ Frontend: React 19 + Tailwind CSS v4 + Vite ] (Port 8443)
                      │
           /api proxy │
                      ▼
[ Backend: Express 5 + TypeScript + Persistent JSON Store ] (Port 5000)
       ├── /api/profile
       ├── /api/schedule
       ├── /api/tasks
       ├── /api/routines
       ├── /api/tutor
       ├── /api/progress
       └── /api/search
```

---

## 📂 Project Structure

```
├── server/
│   ├── index.ts                # Express server entry point & middleware
│   ├── db.ts                   # File-backed database layer with atomic writes
│   ├── routes/
│   │   ├── profile.ts          # Student profile & goal endpoints
│   │   ├── schedule.ts         # Timetable & classes endpoints
│   │   ├── tasks.ts            # Assignments CRUD & status toggle
│   │   ├── routines.ts         # Daily planner routines & habits
│   │   ├── tutor.ts            # AI Tutor chat & conversation management
│   │   ├── progress.ts         # Study metrics, completion stats, focus sessions
│   │   └── search.ts           # Global search across workspace
│   └── services/
│       └── tutorService.ts     # Domain-aware AI tutor engine + Gemini/OpenAI integration
├── data/
│   └── workspace_db.json       # Persistent storage file
├── src/
│   ├── api.ts                  # Typed client library connecting UI to backend
│   ├── App.tsx                 # Full workspace interface & navigation
│   ├── main.tsx                # React root bootstrap
│   └── index.css               # Tailwind CSS theme
├── .env.example                # Environment variable documentation
└── package.json
```

---

## 📡 API Endpoints

### 1. Profile (`/api/profile`)
- `GET /api/profile` — Fetch student profile, major, focus streak, weekly goal & logged hours.
- `PUT /api/profile` — Update student profile details.

### 2. Assignments & Tasks (`/api/tasks`)
- `GET /api/tasks` — List all assignments (supports `?priority=High|Medium|Low` and `?done=true|false`).
- `POST /api/tasks` — Create a new assignment (`title`, `course`, `due`, `priority`).
- `PATCH /api/tasks/:id/toggle` — Toggle task completion status.
- `PUT /api/tasks/:id` — Update assignment details.
- `DELETE /api/tasks/:id` — Delete assignment.

### 3. Routines & Planner (`/api/routines`)
- `GET /api/routines` — List daily routines and habits.
- `POST /api/routines` — Add a custom routine.
- `PATCH /api/routines/:id/toggle` — Add/remove routine from personal daily plan.
- `DELETE /api/routines/:id` — Delete a routine.

### 4. Class Schedule (`/api/schedule`)
- `GET /api/schedule` — Get daily scheduled classes, locations, and time slots.
- `POST /api/schedule` — Add a new class to the timetable.
- `DELETE /api/schedule/:id` — Remove a class.

### 5. ContextAI Tutor (`/api/tutor`)
- `GET /api/tutor` — Retrieve conversation history.
- `POST /api/tutor/chat` — Send message to AI tutor. Contextually responds with explanations, examples, and practice questions.
- `DELETE /api/tutor/clear` — Reset conversation.

### 6. Progress & Focus Sessions (`/api/progress`)
- `GET /api/progress` — Summary of completion rate, tasks done/remaining, and focus minutes.
- `POST /api/progress/focus-session` — Log a completed focus session (e.g. 50 minutes) and update weekly goal progress.

### 7. Global Search (`/api/search`)
- `GET /api/search?q=:query` — Search across all tasks, routines, and scheduled classes.

---

## 🚀 Running the Project

### Option A: Unified Merged Full-Stack Server (Recommended)
Builds and serves both the React frontend and Express API on a **single port**:

```powershell
npm run serve
```
*(or `npm start` if already built)*

- **Merged App (UI + API)**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### Option B: Development Mode (with Live Hot-Reload)
Runs Vite with HMR and the backend server concurrently:

```powershell
npm run dev
```

- **Frontend Dev Server**: [http://localhost:8443](http://localhost:8443)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
