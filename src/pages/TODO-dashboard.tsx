// src/pages/TODO-dashboard.tsx
import React from 'react';
import todoDataJson from '../../TODO.json'; // Adjust the path as necessary
import type { TodoData, Phase, Section, Task, SubTask } from '../types/todo'; // Adjust path if needed
import MainLayout from '@/components/layout/MainLayout'; // Import MainLayout
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card components
import { Checkbox } from '@/components/ui/checkbox'; // Import shadcn Checkbox
import { Badge } from '@/components/ui/badge'; // Import Badge
import { Progress } from '@/components/ui/progress'; // Import Progress
import { cn } from '@/lib/utils'; // Import cn utility
import { Target, ListChecks } from 'lucide-react'; // Import icons

// Cast the imported JSON to our defined type
const todoData: TodoData = todoDataJson as TodoData;

// --- Helper Function to Calculate Progress ---
const calculateProgress = (
  items: (Task | SubTask)[]
): { completed: number; total: number; percentage: number } => {
  let completedCount = 0;
  let totalCount = 0;

  const countTasks = (tasks: (Task | SubTask)[]) => {
    tasks.forEach(task => {
      totalCount++;
      if (task.completed) {
        completedCount++;
      }
      if (task.subTasks && task.subTasks.length > 0) {
        countTasks(task.subTasks);
      }
    });
  };

  countTasks(items);

  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  return { completed: completedCount, total: totalCount, percentage };
};

// --- Helper Component for Rendering Tasks (Handles Recursion) ---
interface TaskItemProps {
  task: Task | SubTask;
  level?: number; // For indentation
}

const TaskItem: React.FC<TaskItemProps> = ({ task, level = 0 }) => {
  // Use Tailwind classes for indentation (adjust multiplier as needed for visual spacing)
  // ml-0, ml-5, ml-10, etc. (corresponds to Tailwind spacing scale)
  const indentClass = `ml-${level * 5}`;

  return (
    <div className={cn('task-item flex items-start gap-2 py-1', indentClass)}>
      <Checkbox
        id={task.id} // Use task id for label association
        checked={task.completed}
        disabled // Make checkbox read-only for display purposes
        aria-label={`Task ${task.completed ? 'completed' : 'pending'}: ${task.text}`}
        className="mt-1" // Align checkbox slightly better with text
      />
      <div className="flex-1">
        <label
          htmlFor={task.id} // Associate label with checkbox
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', // Shadcn label styles
            task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
          )}
        >
          {task.text}
        </label>
        {task.owner && (
          <Badge variant="outline" className="ml-2 text-xs font-normal">
            @{task.owner}
          </Badge>
        )}
        {/* Recursively render subtasks */}
        {task.subTasks && task.subTasks.length > 0 && (
          <div className="subtasks mt-2">
            {task.subTasks.map(subTask => (
              <TaskItem key={subTask.id} task={subTask} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---
const TODODashboard: React.FC = () => {
  return (
    <MainLayout>
      <div className="todo-dashboard p-4 md:p-6 space-y-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <ListChecks className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Project TODO Dashboard</h1>
        </div>

        {todoData.phases.map((phase: Phase) => {
          const phaseProgress = calculateProgress(
            phase.sections.flatMap(section => section.tasks)
          );
          return (
            <Card key={phase.id} className="phase">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2">
                    {phase.name}
                    {phase.priority && (
                      <Badge variant="secondary" className="text-xs font-medium">
                        {phase.priority}
                      </Badge>
                    )}
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {phaseProgress.completed} / {phaseProgress.total} tasks done
                  </span>
                </div>
                {phase.objective && (
                  <CardDescription className="flex items-start gap-2 pt-1">
                    <Target className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                    <span>{phase.objective}</span>
                  </CardDescription>
                )}
                <Progress value={phaseProgress.percentage} className="mt-2 h-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                {phase.sections.map((section: Section) => {
                  const sectionProgress = calculateProgress(section.tasks);
                  return (
                    <div
                      key={section.id}
                      className="section border-l-4 border-border pl-4 py-3 bg-muted/30 rounded-r-md"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          {section.name}
                          {section.priority && (
                            <Badge variant="outline" className="text-xs">
                              {section.priority}
                            </Badge>
                          )}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {sectionProgress.completed} / {sectionProgress.total} tasks done
                        </span>
                      </div>
                      {section.goal && (
                        <p className="text-sm text-muted-foreground italic mb-2">
                          Goal: {section.goal}
                        </p>
                      )}
                      <Progress value={sectionProgress.percentage} className="mb-3 h-1.5" />

                      <div className="tasks space-y-1">
                        {section.tasks.map((task: Task) => (
                          <TaskItem key={task.id} task={task} level={0} /> // Start tasks at level 0 within section
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </MainLayout>
  );
};

export default TODODashboard;
