// src/pages/TODO-dashboard.tsx
import React, { useState, useCallback } from 'react';
import todoDataJson from '../../TODO.json';
import type { TodoData, Phase, Section, Task, SubTask } from '../types/todo';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import ErrorBoundary from '@/components/ErrorBoundary';
import {
  Target,
  ListChecks,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Link as LinkIcon,
  MessageSquare as MessageSquareIcon,
} from 'lucide-react';

// --- Helper Function to Calculate Progress ---
// (No changes needed in calculateProgress)
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
  onToggleTask: (taskId: string, completed: boolean) => void; // Add handler prop
}

const TaskItem: React.FC<TaskItemProps> = ({ task, level = 0, onToggleTask }) => {
  // Use Tailwind classes for indentation
  const indentClass = `ml-${level * 5}`;

  const handleCheckedChange = (checked: boolean | 'indeterminate') => {
    // Ensure we pass a boolean value
    onToggleTask(task.id, !!checked);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div
      className={cn(
        'task-item flex flex-col gap-2 py-2 hover:bg-muted/20 rounded-md px-2',
        indentClass
      )}
    >
      <div className="flex items-start gap-2">
        <Checkbox
          id={task.id}
          checked={task.completed}
          onCheckedChange={handleCheckedChange}
          aria-label={`Task ${task.completed ? 'completed' : 'pending'}: ${task.text}`}
          className="mt-1"
        />
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div
              className={cn(
                'text-sm font-medium', // Basic styles
                task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
              )}
            >
              {task.text}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {task.priority && (
                <Badge
                  variant={
                    task.priority === 'high'
                      ? 'destructive'
                      : task.priority === 'medium'
                        ? 'default'
                        : 'secondary'
                  }
                  className="text-xs"
                >
                  {task.priority}
                </Badge>
              )}
              {task.owner && (
                <Badge variant="outline" className="text-xs font-normal">
                  @{task.owner}
                </Badge>
              )}
            </div>
          </div>

          {/* Task metadata */}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {task.dueDate && (
              <span className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                Due: {formatDate(task.dueDate)}
              </span>
            )}
            {task.estimatedHours && (
              <span className="flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                {task.estimatedHours}h
              </span>
            )}
            {task.dependencies?.length > 0 && (
              <span className="flex items-center gap-1">
                <LinkIcon className="h-3 w-3" />
                {task.dependencies.length} dependencies
              </span>
            )}
            {task.comments?.length > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquareIcon className="h-3 w-3" />
                {task.comments.length}
              </span>
            )}
          </div>

          {/* Labels */}
          {task.labels?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.labels.map(label => (
                <span
                  key={label.id}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs"
                  style={{ backgroundColor: label.color + '20', color: label.color }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          {/* Description preview */}
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
          )}
        </div>
      </div>

      {/* Recursively render subtasks */}
      {task.subTasks && task.subTasks.length > 0 && (
        <div className="subtasks mt-2">
          {task.subTasks.map(subTask => (
            <ErrorBoundary key={subTask.id}>
              <TaskItem
                key={subTask.id}
                task={{
                  ...subTask,
                  labels: subTask.labels || [],
                  comments: subTask.comments || [],
                  dependencies: subTask.dependencies || [],
                  attachments: subTask.attachments || [],
                  watchers: subTask.watchers || [],
                  subTasks: subTask.subTasks || []
                }}
                level={level + 1}
                onToggleTask={onToggleTask}
              />
            </ErrorBoundary>
          ))}
        </div>
      )}
    </div>
  );
};

// Move updateTaskStatus outside the component
const updateTaskStatus = (
  tasks: (Task | SubTask)[],
  taskId: string,
  completed: boolean
): (Task | SubTask)[] => {
  return tasks.map(task => {
    if (task.id === taskId) {
      return { ...task, completed };
    }
    if (task.subTasks && task.subTasks.length > 0) {
      const updatedSubTasks = updateTaskStatus(task.subTasks, taskId, completed);
      if (updatedSubTasks !== task.subTasks) {
        return { ...task, subTasks: updatedSubTasks };
      }
    }
    return task;
  });
};

// --- Main Dashboard Component ---
const TODODashboard: React.FC = () => {
  // --- State Management ---
  const [tasksData, setTasksData] = useState<TodoData>(todoDataJson as TodoData);

  // --- Toggle Handler ---
  const handleToggleTask = useCallback(
    (taskId: string, completed: boolean) => {
      setTasksData(currentData => {
        const newPhases = currentData.phases.map(phase => {
          const newSections = phase.sections.map(section => {
            const updatedTasks = updateTaskStatus(section.tasks, taskId, completed);
            if (updatedTasks !== section.tasks) {
              return { ...section, tasks: updatedTasks };
            }
            return section;
          });
          if (newSections !== phase.sections) {
            return { ...phase, sections: newSections };
          }
          return phase;
        });
        if (newPhases !== currentData.phases) {
          return { ...currentData, phases: newPhases };
        }
        return currentData;
      });
    },
    [] // Remove updateTaskStatus from dependencies since it's now stable
  );

  return (
    <MainLayout>
      <div className="todo-dashboard p-4 md:p-6 space-y-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <ListChecks className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Project TODO Dashboard</h1>
        </div>

        {/* Iterate over the state data (tasksData) instead of the static import */}
        {tasksData.phases.map((phase: Phase) => {
          // Recalculate progress based on the current state
          const phaseProgress = calculateProgress(phase.sections.flatMap(section => section.tasks));
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
                {/* Progress bar updates automatically */}
                <Progress value={phaseProgress.percentage} className="mt-2 h-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                {phase.sections.map((section: Section) => {
                  // Recalculate progress based on the current state
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
                      {/* Progress bar updates automatically */}
                      <Progress value={sectionProgress.percentage} className="mb-3 h-1.5" />

                      <div className="tasks space-y-1">
                        {section.tasks.map((task: Task) => (
                          <ErrorBoundary key={task.id}>
                            <TaskItem
                              key={task.id}
                              task={{
                                ...task,
                                labels: task.labels || [],
                                comments: task.comments || [],
                                dependencies: task.dependencies || [],
                                attachments: task.attachments || [],
                                watchers: task.watchers || [],
                                subTasks: task.subTasks || []
                              }}
                              level={0}
                              onToggleTask={handleToggleTask} // Pass the handler down
                            />
                          </ErrorBoundary>
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
