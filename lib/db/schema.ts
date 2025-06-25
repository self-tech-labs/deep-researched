import { pgTable, serial, text, timestamp, varchar, jsonb, integer } from 'drizzle-orm/pg-core';

export const researches = pgTable('researches', {
  id: serial('id').primaryKey(),
  url: text('url').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  content: text('content'),
  summary: text('summary'), // AI-generated summary
  provider: varchar('provider', { length: 50 }), // e.g., 'claude', 'chatgpt', 'gemini', 'grok'
  category: varchar('category', { length: 50 }), // AI-determined category
  metadata: jsonb('metadata'), // Additional structured data
  tags: text('tags').array(), // Array of relevant tags
  authorHandle: text('author_handle'), // Social media handle or link
  authorName: text('author_name'),
  viewCount: integer('view_count').default(0).notNull(),
  upvotes: integer('upvotes').default(0).notNull(),
  isProcessed: varchar('is_processed', { length: 20 }).default('pending').notNull(), // 'pending', 'processed', 'failed'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Research = typeof researches.$inferSelect;
export type NewResearch = typeof researches.$inferInsert; 