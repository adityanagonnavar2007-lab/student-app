CREATE TABLE "chat_messages" (
	"seq" serial PRIMARY KEY,
	"id" text NOT NULL UNIQUE,
	"from" text NOT NULL,
	"text" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "focus_sessions" (
	"id" text PRIMARY KEY,
	"duration_minutes" integer NOT NULL,
	"topic" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" integer PRIMARY KEY,
	"name" text NOT NULL,
	"initials" text NOT NULL,
	"major" text NOT NULL,
	"focus_streak_days" integer DEFAULT 0 NOT NULL,
	"weekly_goal_hours" real DEFAULT 20 NOT NULL,
	"weekly_logged_hours" real DEFAULT 0 NOT NULL,
	"avatar_color" text NOT NULL,
	"badge_color" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routines" (
	"id" text PRIMARY KEY,
	"time" text NOT NULL,
	"title" text NOT NULL,
	"detail" text NOT NULL,
	"icon" text NOT NULL,
	"color" text NOT NULL,
	"added" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule" (
	"id" text PRIMARY KEY,
	"time" text NOT NULL,
	"period" text NOT NULL,
	"title" text NOT NULL,
	"room" text NOT NULL,
	"tone" text NOT NULL,
	"icon" text NOT NULL,
	"course_code" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" bigint PRIMARY KEY,
	"title" text NOT NULL,
	"course" text NOT NULL,
	"due" text NOT NULL,
	"done" boolean DEFAULT false NOT NULL,
	"priority" text DEFAULT 'Medium' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
