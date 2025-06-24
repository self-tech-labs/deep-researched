import { pgTable, serial, text, timestamp, varchar, jsonb } from 'drizzle-orm/pg-core';

export const researches = pgTable('researches', {
  id: serial('id').primaryKey(),
  url: text('url').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  content: text('content'),
  provider: varchar('provider', { length: 50 }), // e.g., 'claude', 'chatgpt', 'gemini', 'grok'
  metadata: jsonb('metadata'), // Additional structured data
  tags: text('tags').array(), // Array of relevant tags
  authorHandle: text('author_handle'), // Social media handle or link
  authorName: text('author_name'),
  viewCount: serial('view_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Research = typeof researches.$inferSelect;
export type NewResearch = typeof researches.$inferInsert; 