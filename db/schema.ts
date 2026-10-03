import { bigint, boolean, integer, pgTable, real, serial, text, timestamp } from "drizzle-orm/pg-core";

// Single-student workspace: the profile table holds one row (id = 1).
export const profile = pgTable("profile", {
  id: integer().primaryKey(),
  name: text().notNull(),
  initials: text().notNull(),
  major: text().notNull(),
  focusStreakDays: integer("focus_streak_days").notNull().default(0),
  weeklyGoalHours: real("weekly_goal_hours").notNull().default(20),
  weeklyLoggedHours: real("weekly_logged_hours").notNull().default(0),
  avatarColor: text("avatar_color").notNull(),
  badgeColor: text("badge_color").notNull(),
});

export const schedule = pgTable("schedule", {
  id: text().primaryKey(),
  time: text().notNull(),
  period: text().notNull(),
  title: text().notNull(),
  room: text().notNull(),
  tone: text().notNull(),
  icon: text().notNull(),
  courseCode: text("course_code").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: bigint({ mode: "number" }).primaryKey(),
  title: text().notNull(),
  course: text().notNull(),
  due: text().notNull(),
  done: boolean().notNull().default(false),
  priority: text().notNull().default("Medium"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const routines = pgTable("routines", {
  id: text().primaryKey(),
  time: text().notNull(),
  title: text().notNull(),
  detail: text().notNull(),
  icon: text().notNull(),
  color: text().notNull(),
  added: boolean().notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  seq: serial().primaryKey(),
  id: text().notNull().unique(),
  from: text().notNull(),
  text: text().notNull(),
  timestamp: timestamp().notNull().defaultNow(),
});

export const focusSessions = pgTable("focus_sessions", {
  id: text().primaryKey(),
  durationMinutes: integer("duration_minutes").notNull(),
  topic: text(),
  timestamp: timestamp().notNull().defaultNow(),
});
