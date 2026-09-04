import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').default('citizen').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const civicIssues = pgTable('civic_issues', {
  id: serial('id').primaryKey(),
  issueCode: text('issue_code').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  status: text('status').default('reported').notNull(),
  severity: text('severity').default('medium').notNull(),
  visualSeverityScore: integer('visual_severity_score').default(0).notNull(),
  location: text('location').notNull(),
  imageUrl: text('image_url').notNull(),
  isAuthentic: boolean('is_authentic').default(true).notNull(),
  aiConfidence: integer('ai_confidence').default(90).notNull(),
  authenticityLabel: text('authenticity_label').default('authentic').notNull(),
  detectedHazardCount: integer('detected_hazard_count').default(1).notNull(),
  reportedByUid: text('reported_by_uid').notNull(),
  reporterEmail: text('reporter_email'),
  resolvedImageUrl: text('resolved_image_url'),
  resolutionConfidence: integer('resolution_confidence'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  issues: many(civicIssues),
}));

export const civicIssuesRelations = relations(civicIssues, ({ one }) => ({
  reporter: one(users, {
    fields: [civicIssues.reportedByUid],
    references: [users.uid],
  }),
}));
