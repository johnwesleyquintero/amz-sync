// src/types/todo.ts

export interface Attachment {
  filename: string;
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  attachments: Attachment[];
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
  owner: string | null;
  description?: string;
  dueDate?: string | null;
  startDate?: string | null;
  priority?: 'low' | 'medium' | 'high' | null;
  estimatedHours?: number | null;
  labels?: Label[];
  attachments?: Attachment[];
  comments?: Comment[];
  dependencies?: string[]; // Array of task IDs this task depends on
  watchers?: string[]; // Array of user IDs watching this task
  createdAt?: string;
  updatedAt?: string;
  subTasks?: SubTask[]; // Recursive definition for nested subtasks
}

// Task has the same structure as SubTask at the top level
export type Task = SubTask;

export interface TasksData {
  phases: Phase[];
}

export interface TodoData {
  phases: Phase[];
}

export interface Section {
  id: string;
  name: string;
  tasks: Task[];
}

export interface Phase {
  id: string;
  name: string;
  objective: string;
  priority: string | null;
  sections: Section[];
  completed: boolean;
  dependsOn?: string[];
}

export interface Phase {
  id: string;
  name: string;
  objective: string;
  priority: string | null;
  completed: boolean;
  dependsOn?: string[];
  sections: Section[];
}

export interface TasksData {
  phases: Phase[];
}

export interface TodoData {
  phases: Phase[];
}
