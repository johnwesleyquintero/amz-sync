// src/pages/TODO-dashboard.tsx
import React, { useState, useCallback, useMemo } from 'react';
import todoDataJson from '../data/TODO.json';
import type { TodoData, Phase, Section, Task, SubTask } from '../types/todo';
import { todoSchema } from '@/lib/schemas/todo-schema';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ErrorBoundary from '@/components/ErrorBoundary';
import TodoDataGrid from '@/components/dashboard/TodoDataGrid';
import {
  Target,
  ListChecks,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Link as LinkIcon,
  MessageSquare as MessageSquareIcon,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Paperclip,
  Users,
  CheckCircle,
  Grid as GridIcon,
  List as ListIcon,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhaseProgress {
  percentage: number;
  completed: number;
  total: number;
}

interface Progress {
  completed: number;
  total: number;
  percentage: number;
}

// --- Helper Functions ---
const calculateProgress = (items: (Task | SubTask)[]): Progress => {
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
  if (totalCount === 0) {
    return { completed: 0, total: 0, percentage: 100 };
  }

  return { completed: completedCount, total: totalCount, percentage };
};

const flattenTasks = (items: (Task | SubTask)[]): (Task | SubTask)[] => {
  const flattened: (Task | SubTask)[] = [];

  const flatten = (tasks: (Task | SubTask)[]) => {
    tasks.forEach(task => {
      flattened.push(task);
      if (task.subTasks && task.subTasks.length > 0) {
        flatten(task.subTasks);
      }
    });
  };

  flatten(items);
  return flattened;
};

const updateTaskStatus = (
  tasks: (Task | SubTask)[],
  taskId: string,
  completed: boolean
): (Task | SubTask)[] => {
  return tasks.map(task => {
    const updatedTask = { ...task };

    if (updatedTask.id === taskId) {
      updatedTask.completed = completed;
    }

    if (updatedTask.subTasks && updatedTask.subTasks.length > 0) {
      const updatedSubTasks = updateTaskStatus(updatedTask.subTasks, taskId, completed);
      if (updatedSubTasks !== updatedTask.subTasks) {
        updatedTask.subTasks = updatedSubTasks;
      }
    }

    if (
      updatedTask.id === taskId ||
      (updatedTask.subTasks && updatedTask.subTasks !== task.subTasks)
    ) {
      return updatedTask;
    }

    return task;
  });
};

// --- Task Item Component ---
interface TaskItemProps {
  task: Task | SubTask;
  level?: number;
  onToggleTask: (taskId: string, completed: boolean) => void;
}

// --- Main Dashboard Component ---
const TODODashboard: React.FC = () => {
  const { toast } = useToast();

  // --- State Management ---
  const [tasksData, setTasksData] = useState<TodoData>(() => {
    return todoDataJson as TodoData;
  });

  // --- Memoized Phase Dependencies ---
  const unlockedPhases = useMemo(() => {
    const completedPhaseIds = new Set(tasksData.phases.filter(p => p.completed).map(p => p.id));
    return tasksData.phases.filter(
      phase => phase.dependsOn?.every(depId => completedPhaseIds.has(depId)) ?? true
    );
  }, [tasksData.phases]);

  // --- Phase Completion Handler ---
  const handlePhaseComplete = useCallback(
    (phaseId: string) => {
      setTasksData(currentData => {
        const phaseToComplete = currentData.phases.find(p => p.id === phaseId);
        if (!phaseToComplete) return currentData;

        const allDepsMet =
          phaseToComplete.dependsOn?.every(
            depId => currentData.phases.find(p => p.id === depId)?.completed
          ) ?? true;

        if (!allDepsMet) {
          toast({
            title: 'Dependency Error',
            description: `Cannot complete phase "${phaseToComplete.name}": Prerequisite phases are not marked complete.`,
            variant: 'destructive',
          });
          return currentData;
        }

        const phaseProgress = calculateProgress(
          phaseToComplete.sections.flatMap(section => section.tasks)
        );
        if (phaseProgress.percentage < 100) {
          toast({
            title: 'Incomplete Tasks',
            description: `Cannot mark phase "${phaseToComplete.name}" as complete: ${phaseProgress.total - phaseProgress.completed} task(s) still pending.`,
          });
          return currentData;
        }

        const updatedPhases = currentData.phases.map(phase =>
          phase.id === phaseId ? { ...phase, completed: true } : phase
        );

        toast({
          title: 'Phase Completed',
          description: `Phase "${phaseToComplete.name}" marked as complete.`,
        });

        return { ...currentData, phases: updatedPhases };
      });
    },
    [toast]
  );

  // --- Task Toggle Handler ---
  const handleToggleTask = useCallback((taskId: string, completed: boolean) => {
    setTasksData(currentData => {
      const newPhases = currentData.phases.map(phase => {
        let phaseUpdated = false;
        const newSections = phase.sections.map(section => {
          const updatedTasks = updateTaskStatus(section.tasks, taskId, completed);
          if (updatedTasks !== section.tasks) {
            phaseUpdated = true;
            return { ...section, tasks: updatedTasks };
          }
          return section as Section;
        });

        if (phaseUpdated) {
          return { ...phase, sections: newSections };
        }
        return phase;
      });

      if (newPhases !== currentData.phases) {
        return { ...currentData, phases: newPhases };
      }
      return currentData;
    });
  }, []);

  // --- Rendering ---
  return (
    <MainLayout>
      <div className="todo-dashboard p-4 md:p-6 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div className="flex items-center gap-3">
            <ListChecks className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Project TODO Dashboard</h1>
          </div>
        </div>

        {/* Render Unlocked Phases */}
        {unlockedPhases.length > 0 ? (
          unlockedPhases.map((phase: Phase) => {
            const phaseProgress = calculateProgress(
              phase.sections.flatMap(section => section.tasks)
            );
            const phaseProgressData: PhaseProgress = {
              percentage: phaseProgress.percentage,
              completed: phaseProgress.completed,
              total: phaseProgress.total,
            };
            const isPhaseComplete = phase.completed;
            const canMarkComplete = phaseProgressData.percentage === 100 && !isPhaseComplete;

            return (
              <ErrorBoundary key={phase.id} fallback={<p>Error loading phase {phase.name}.</p>}>
                <Card className={cn(isPhaseComplete ? 'opacity-70 border-green-600/50' : '')}>
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        {phase.name}
                        {phase.priority && (
                          <Badge variant="secondary" className="text-xs font-medium">
                            {phase.priority}
                          </Badge>
                        )}
                        {isPhaseComplete && phaseProgressData.percentage < 100 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Warning: Phase marked complete, but tasks are pending.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </CardTitle>

                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {phaseProgressData.completed} / {phaseProgressData.total} tasks (
                          {phaseProgressData.percentage}%)
                        </span>
                        <Button
                          size="sm"
                          variant={canMarkComplete ? 'default' : 'outline'}
                          disabled={!canMarkComplete}
                          onClick={() => handlePhaseComplete(phase.id)}
                          className={cn(
                            'h-7 px-2 py-1 text-xs',
                            isPhaseComplete && 'bg-green-600 hover:bg-green-700 text-white'
                          )}
                          aria-label={
                            isPhaseComplete
                              ? 'Phase already completed'
                              : canMarkComplete
                                ? `Mark phase ${phase.name} as complete`
                                : 'Complete all tasks to enable'
                          }
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          {isPhaseComplete ? 'Completed' : 'Mark Complete'}
                        </Button>
                      </div>
                    </div>
                    {phase.objective && (
                      <CardDescription className="flex items-start gap-2 pt-2 text-base">
                        <Target className="h-4 w-4 mt-1 flex-shrink-0 text-muted-foreground" />
                        <span>{phase.objective}</span>
                      </CardDescription>
                    )}
                    <Progress
                      value={phaseProgressData.percentage}
                      className="mt-3 h-2"
                      aria-label={`Phase ${phase.name} progress: ${phaseProgressData.percentage}%`}
                    />
                  </CardHeader>
                  <CardContent className="space-y-5 pt-0">
                    {phase.sections.map((section: Section) => (
                      <TodoDataGrid
                        key={section.id}
                        tasks={section.tasks}
                        onToggleTask={handleToggleTask}
                      />
                    ))}
                  </CardContent>
                </Card>
              </ErrorBoundary>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p>No active phases available. Check dependencies or add phases to TODO.json.</p>
            </CardContent>
          </Card>
        )}

        {/* Display Locked Phases */}
        {tasksData.phases.filter(p => !unlockedPhases.some(up => up.id === p.id)).length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold text-muted-foreground mb-3">
              Locked Phases (Dependencies Not Met)
            </h2>
            <div className="space-y-2">
              {tasksData.phases
                .filter(p => !unlockedPhases.some(up => up.id === p.id))
                .map(lockedPhase => (
                  <TooltipProvider key={lockedPhase.id} delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-sm text-muted-foreground p-2 border rounded bg-muted/30 cursor-default">
                          {lockedPhase.name}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Requires completion of: {lockedPhase.dependsOn?.join(', ') || 'Unknown'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default TODODashboard;
