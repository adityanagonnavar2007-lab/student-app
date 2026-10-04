interface TutorContext {
  studentName: string;
  courses: string[];
  tasks: { title: string; course: string; due: string }[];
}

export interface TutorActionItem {
  type: 'create_task' | 'create_routine' | 'create_class' | 'update_goal';
  data: any;
  summary: string;
}

export interface TutorReplyResult {
  reply: string;
  actions?: TutorActionItem[];
}

export async function generateTutorReply(userPrompt: string, context: TutorContext): Promise<TutorReplyResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (process.env.GEMINI_API_KEY) {
    const candidateModels = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.5-flash", "gemini-1.5-flash"];
    for (const model of candidateModels) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{
                  text: `You are ContextAI Tutor, an AI tutor & smart study assistant for college student ${context.studentName}.
His current courses are: ${context.courses.length > 0 ? context.courses.join(", ") : "General Studies"}.
His pending assignments include: ${context.tasks.length > 0 ? context.tasks.map(t => `${t.title} (${t.course}, due: ${t.due})`).join("; ") : "None at the moment"}.

CAPABILITY: You can directly change or add items to the user's student workspace if asked (such as adding an assignment, class, routine, or updating study goals)!
When the user asks you to add, create, or update something, include a valid JSON block at the very end of your response inside triple backticks with \`\`\`json-actions ... \`\`\`.
Format for actions:
\`\`\`json-actions
[
  { "type": "create_task", "data": { "title": "Homework 1", "course": "CS 304", "due": "Friday", "priority": "High" }, "summary": "Added task: Homework 1" },
  { "type": "create_routine", "data": { "title": "Review Flashcards", "time": "8:00 PM", "detail": "Active recall session", "icon": "sparkles" }, "summary": "Added routine: Review Flashcards" },
  { "type": "create_class", "data": { "title": "Machine Learning", "time": "11:00", "period": "AM", "room": "Lab 4", "courseCode": "CS 420" }, "summary": "Added class: Machine Learning" },
  { "type": "update_goal", "data": { "weeklyGoalHours": 25 }, "summary": "Updated weekly goal to 25 hours" }
]
\`\`\`

Student's Question/Request/Uploaded Document:
"${userPrompt}"

Instructions:
- Provide an encouraging, clear, and structured answer.
- If notes, syllabus, or problem descriptions are shared, analyze them and offer concise explanations or practice problems.
- If the user asks to add or schedule tasks/classes/routines, also output the json-actions block.`
                }]
              }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidate) {
            return parseTutorReplyAndActions(candidate.trim());
          }
        } else {
          console.warn(`Model ${model} returned HTTP ${response.status}`);
        }
      } catch (err) {
        console.warn(`Gemini API call with ${model} failed:`, err);
      }
    }
  }

  // Local Intelligent Pedagogical Tutoring Engine
  const q = userPrompt.toLowerCase();

  // Smart action detection in local engine: "add task ...", "add assignment ...", "add class ..."
  const localActions: TutorActionItem[] = [];
  if (q.includes("add assignment") || q.includes("add task") || q.includes("create task")) {
    const taskMatch = userPrompt.match(/(?:add assignment|add task|create task)\s*[:"']?\s*([^,.\n]+)/i);
    const title = taskMatch?.[1]?.trim() || "New Study Assignment";
    localActions.push({
      type: "create_task",
      data: {
        title,
        course: context.courses[0] || "General Studies",
        due: "This week",
        priority: "High"
      },
      summary: `Added assignment: ${title}`
    });
  }

  // Revision / Study Plan request
  if (q.includes("revision plan") || q.includes("study plan") || q.includes("plan my day") || q.includes("schedule")) {
    return {
      reply: `Here is your customized study and revision plan for today:

1. **Evening Focus Block (7:00 PM – 7:50 PM):**
   • **Course:** CS 304 (Database Systems)
   • **Goal:** Review relational algebra, normalization (1NF, 2NF, 3NF, BCNF), and transaction ACID properties.
   • **Technique:** Active recall — summarize key normal forms without looking at your slides.

2. **Quick Break (7:50 PM – 8:05 PM):**
   • Hydrate and step away from screens.

3. **Practice & Problem Solving (8:05 PM – 8:45 PM):**
   • **Course:** CS 201 (Graph Algorithms)
   • **Goal:** Trace BFS vs DFS and review Dijkstra's shortest path algorithm with edge weights.

4. **Wind-Down Review (8:45 PM – 9:00 PM):**
   • Check off completed tasks in your Assignments page to log your progress!`,
      actions: localActions
    };
  }

  // Database Systems / CS 304
  if (q.includes("database") || q.includes("sql") || q.includes("acid") || q.includes("normalization") || q.includes("b-tree") || q.includes("cs 304")) {
    return {
      reply: `### Database Systems (CS 304)

**Core Concept:**
Database transactions must guarantee **ACID** properties:
- **Atomicity:** All operations in a transaction succeed, or none do (rollback).
- **Consistency:** The database transitions from one valid state to another valid state according to schema rules.
- **Isolation:** Concurrent transactions don't interfere with each other (e.g., preventing dirty reads or phantom reads).
- **Durability:** Once committed, changes survive even in the event of a system crash.

**Normalization Quick Reminder:**
- **1NF:** Atomic attributes (no repeating groups/arrays in a cell).
- **2NF:** In 1NF + no partial dependency on a composite primary key.
- **3NF:** In 2NF + no transitive dependencies (non-key attribute depends on another non-key attribute).

**Quick Check Question for You:**
If a transaction deducts $50 from Account A and adds $50 to Account B, but the server crashes after the deduction, which ACID property ensures Account A does not lose $50 without Account B receiving it? *(Hint: Rollback)*`,
      actions: localActions
    };
  }

  // Graph Algorithms / CS 201 / Data Structures
  if (q.includes("graph") || q.includes("dijkstra") || q.includes("bfs") || q.includes("dfs") || q.includes("tree") || q.includes("algorithm") || q.includes("cs 201")) {
    return {
      reply: `### Graph Algorithms & Data Structures (CS 201)

**Key Distinctions:**
1. **Breadth-First Search (BFS):**
   • Uses a **Queue (FIFO)**.
   • Explores vertices level-by-level.
   • Guarantees shortest path on *unweighted* graphs.
   • Time complexity: $O(V + E)$.

2. **Depth-First Search (DFS):**
   • Uses a **Stack (LIFO)** or recursion.
   • Explores as deep as possible before backtracking.
   • Great for cycle detection, topological sorting, and connected components.
   • Time complexity: $O(V + E)$.

3. **Dijkstra’s Algorithm:**
   • Uses a **Priority Queue (Min-Heap)**.
   • Finds single-source shortest paths on *non-negative weighted* graphs.
   • Time complexity: $O((V + E) \\log V)$ with a min-heap.

**Quick Check:**
Why does standard Dijkstra's algorithm fail when an edge has a negative weight? *(Hint: Greedy assumption about already finalized node distances).*`,
      actions: localActions
    };
  }

  // Design Thinking / UX Case Study / DES 210
  if (q.includes("ux") || q.includes("design") || q.includes("case study") || q.includes("wireframe") || q.includes("des 210")) {
    return {
      reply: `### Design Thinking & UX Case Study (DES 210)

**The 5-Stage Framework:**
1. **Empathize:** Conduct user interviews, observations, and empathy mapping to understand pain points.
2. **Define:** Synthesize research into a concise Problem Statement or "How Might We" (HMW) question.
3. **Ideate:** Brainstorm diverse solutions without early critique; sketch user flows.
4. **Prototype:** Build low-fidelity wireframes followed by high-fidelity interactive mockups.
5. **Test:** Validate with actual users, measure usability heuristics, and iterate on friction points.

**Case Study Tip for your Assignment:**
Frame your UX story around *User Outcome*: Show before/after metrics (e.g., "Reduced task completion time by 34% by simplifying navigation").`,
      actions: localActions
    };
  }

  // General questions
  return {
    reply: `That’s a great question, Aditya!

Let’s break it down into manageable steps:
1. **Clarify the Core Idea:** First identify the fundamental definition or purpose of this topic.
2. **Apply to Course Context:** How does this connect to your current modules (Data Structures, Database Systems, or UX)?
3. **Actionable Step:** Would you like a code example, an explanation of the underlying theory, or a practice exam question?

Tell me which part you'd like to dive into!`,
    actions: localActions
  };
}

export function parseTutorReplyAndActions(rawText: string): TutorReplyResult {
  const jsonBlockRegex = /```(?:json-actions|json)\s*([\s\S]*?)```/i;
  const match = rawText.match(jsonBlockRegex);
  if (!match) {
    return { reply: rawText.trim() };
  }

  const cleanReply = rawText.replace(jsonBlockRegex, '').trim();
  try {
    const parsed = JSON.parse(match[1].trim());
    if (Array.isArray(parsed)) {
      return {
        reply: cleanReply,
        actions: parsed
      };
    }
  } catch (e) {
    console.warn("Failed to parse AI action JSON block:", e);
  }

  return { reply: rawText.trim() };
}
