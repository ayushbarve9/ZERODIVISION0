import { db } from './index.ts';
import { civicIssues } from './schema.ts';
import { desc, eq } from 'drizzle-orm';

export interface NewCivicIssueInput {
  issueCode: string;
  title: string;
  description: string;
  category: string;
  status?: string;
  severity?: string;
  visualSeverityScore?: number;
  location: string;
  imageUrl: string;
  isAuthentic?: boolean;
  aiConfidence?: number;
  authenticityLabel?: string;
  detectedHazardCount?: number;
  reportedByUid: string;
  reporterEmail?: string;
}

export async function getCivicIssues() {
  try {
    return await db.select().from(civicIssues).orderBy(desc(civicIssues.createdAt));
  } catch (error) {
    console.error('Failed to get civic issues from database:', error);
    throw new Error('Database query failed. Could not fetch issues.', { cause: error });
  }
}

export async function getCivicIssueById(id: number) {
  try {
    const result = await db.select().from(civicIssues).where(eq(civicIssues.id, id));
    return result[0] || null;
  } catch (error) {
    console.error(`Failed to get civic issue #${id}:`, error);
    throw new Error('Database query failed. Could not fetch issue.', { cause: error });
  }
}

export async function createCivicIssue(input: NewCivicIssueInput) {
  try {
    const result = await db
      .insert(civicIssues)
      .values({
        issueCode: input.issueCode,
        title: input.title,
        description: input.description,
        category: input.category,
        status: input.status || 'reported',
        severity: input.severity || 'medium',
        visualSeverityScore: input.visualSeverityScore || 0,
        location: input.location,
        imageUrl: input.imageUrl,
        isAuthentic: input.isAuthentic ?? true,
        aiConfidence: input.aiConfidence ?? 90,
        authenticityLabel: input.authenticityLabel || 'authentic',
        detectedHazardCount: input.detectedHazardCount || 1,
        reportedByUid: input.reportedByUid,
        reporterEmail: input.reporterEmail || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to insert civic issue into Cloud SQL:', error);
    throw new Error('Database write failed. Could not create issue record.', { cause: error });
  }
}

export async function updateCivicIssue(
  id: number,
  updates: Partial<{
    status: string;
    resolvedImageUrl: string;
    resolutionConfidence: number;
    severity: string;
    description: string;
  }>
) {
  try {
    const result = await db
      .update(civicIssues)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(civicIssues.id, id))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error(`Failed to update civic issue #${id}:`, error);
    throw new Error('Database write failed. Could not update issue.', { cause: error });
  }
}
