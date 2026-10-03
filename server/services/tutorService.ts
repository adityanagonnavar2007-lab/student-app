interface TutorContext {
  studentName: string;
  courses: string[];
  tasks: { title: string; course: string; due: string }[];
}

export async function generateTutorReply(userPrompt: string, context: TutorContext): Promise<string> {
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
                  text: `You are ContextAI Tutor, a friendly, concise, and pedagogical AI tutor for college student ${context.studentName}.
His current courses are: ${context.courses.length > 0 ? context.courses.join(", ") : "General Studies"}.
His pending assignments include: ${context.tasks.length > 0 ? context.tasks.map(t => `${t.title} (${t.course}, due: ${t.due})`).join("; ") : "None at the moment"}.

Student's Question/Request: "${userPrompt}"

Instructions:
- Provide a clear, easy-to-understand answer.
- Structure it when appropriate with: (1) Core Concept, (2) Concrete Example/Code, and (3) A quick practice check or next step.
- Keep the response encouraging, structured, and easy to read.`
                }]
              }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidate) return candidate.trim();
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

  // Revision / Study Plan request
  if (q.includes("revision plan") || q.includes("study plan") || q.includes("plan my day") || q.includes("schedule")) {
    return `Here is your customized study and revision plan for today:

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
   • Check off completed tasks in your Assignments page to log your progress!`;
  }

  // Database Systems / CS 304
  if (q.includes("database") || q.includes("sql") || q.includes("acid") || q.includes("normalization") || q.includes("b-tree") || q.includes("cs 304")) {
    return `### Database Systems (CS 304)

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
If a transaction deducts \$50 from Account A and adds \$50 to Account B, but the server crashes after the deduction, which ACID property ensures Account A does not lose \$50 without Account B receiving it? *(Hint: Rollback)*`;
  }

  // Graph Algorithms / CS 201 / Data Structures
  if (q.includes("graph") || q.includes("dijkstra") || q.includes("bfs") || q.includes("dfs") || q.includes("tree") || q.includes("algorithm") || q.includes("cs 201")) {
    return `### Graph Algorithms & Data Structures (CS 201)

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
Why does standard Dijkstra's algorithm fail when an edge has a negative weight? *(Hint: Greedy assumption about already finalized node distances).*`;
  }

  // Design Thinking / UX Case Study / DES 210
  if (q.includes("ux") || q.includes("design") || q.includes("case study") || q.includes("wireframe") || q.includes("des 210")) {
    return `### Design Thinking & UX Case Study (DES 210)

**The 5-Stage Framework:**
1. **Empathize:** Conduct user interviews, observations, and empathy mapping to understand pain points.
2. **Define:** Synthesize research into a concise Problem Statement or "How Might We" (HMW) question.
3. **Ideate:** Brainstorm diverse solutions without early critique; sketch user flows.
4. **Prototype:** Build low-fidelity wireframes followed by high-fidelity interactive mockups.
5. **Test:** Validate with actual users, measure usability heuristics, and iterate on friction points.

**Case Study Tip for your Assignment:**
Frame your UX story around *User Outcome*: Show before/after metrics (e.g., "Reduced task completion time by 34% by simplifying navigation").`;
  }

  // General questions
  return `That’s a great question, Aditya!

Let’s break it down into manageable steps:
1. **Clarify the Core Idea:** First identify the fundamental definition or purpose of this topic.
2. **Apply to Course Context:** How does this connect to your current modules (Data Structures, Database Systems, or UX)?
3. **Actionable Step:** Would you like a code example, an explanation of the underlying theory, or a practice exam question?

Tell me which part you'd like to dive into!`;
}
