import { z } from 'zod';

// Base schemas for reusable components
const attachmentSchema = z.object({
  filename: z.string(),
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  type: z.string(),
  size: z.number().positive(),
  createdAt: z.string().datetime(),
});

const commentSchema = z.object({
  id: z.string(),
  text: z.string(),
  author: z.string(),
  createdAt: z.string().datetime(),
  attachments: z.array(attachmentSchema).default([]),
});

const labelSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

// Recursive schema for tasks and subtasks
const priorityEnum = z.enum(['low', 'medium', 'high']).nullable();

export const subTaskSchema = z.lazy(() =>
  z.object({
    id: z.string(),
    text: z.string(),
    completed: z.boolean(),
    owner: z.string().nullable(),
    description: z.string().optional(),
    dueDate: z.string().datetime().nullable().optional(),
    startDate: z.string().datetime().nullable().optional(),
    priority: priorityEnum.optional(),
    estimatedHours: z.number().positive().nullable().optional(),
    labels: z.array(labelSchema).optional(),
    attachments: z.array(attachmentSchema).optional(),
    comments: z.array(commentSchema).optional(),
    dependencies: z.array(z.string()).optional(),
    watchers: z.array(z.string()).optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
    subTasks: z.array(z.lazy(() => subTaskSchema)).optional(),
  })
);

// Task schema (same as SubTask)
export const taskSchema = subTaskSchema;

// Section schema
export const sectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  goal: z.string().optional(),
  priority: z.string().optional(),
  tasks: z.array(taskSchema),
});

// Phase schema
export const phaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  objective: z.string().optional(),
  priority: z.string().optional(),
  dependsOn: z.array(z.string()).optional(),
  completed: z.boolean(),
  sections: z.array(sectionSchema),
});

// Root TODO schema
export const todoSchema = z.object({
  phases: z.array(phaseSchema),
});

// Type inference
export type TodoSchema = z.infer<typeof todoSchema>;
export type PhaseSchema = z.infer<typeof phaseSchema>;
export type SectionSchema = z.infer<typeof sectionSchema>;
export type TaskSchema = z.infer<typeof taskSchema>;
export type SubTaskSchema = z.infer<typeof subTaskSchema>;
export type LabelSchema = z.infer<typeof labelSchema>;
export type CommentSchema = z.infer<typeof commentSchema>;
export type AttachmentSchema = z.infer<typeof attachmentSchema>;
