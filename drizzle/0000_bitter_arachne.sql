CREATE TABLE "researches" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" text,
	"summary" text,
	"provider" varchar(50),
	"category" varchar(50),
	"metadata" jsonb,
	"tags" text[],
	"author_handle" text,
	"author_name" text,
	"view_count" integer DEFAULT 0 NOT NULL,
	"is_processed" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "researches_url_unique" UNIQUE("url")
);
