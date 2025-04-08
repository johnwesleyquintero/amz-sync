// src/types/todo.ts

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
  owner: string | null;
  subTasks: SubTask[]; // Recursive definition for nested subtasks
}

// Task has the same structure as SubTask at the top level
export type Task = SubTask;

export interface Section {
  id: string;
  name: string;
  goal: string | null;
  priority: string | null;
  tasks: Task[];
}

export interface Phase {
  id: string;
  name: string;
  objective: string;
  priority: string | null;
  sections: Section[];
}

export interface TodoData {
  phases: Phase[];
}
