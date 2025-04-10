// src/pages/TODO-dashboard.tsx
import React, { useState, useCallback, useMemo } from 'react';
import todoDataJson from '../../TODO.json'; // Assuming this path is correct
import type { TodoData, Phase, Section, Task, SubTask } from '../types/todo'; // Assuming types are defined here
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ErrorBoundary from '@/components/ErrorBoundary';
import {
  Target,
  ListChecks,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Link as LinkIcon,
  MessageSquare as MessageSquareIcon,
  ChevronDown,
  ChevronRight,
  AlertTriangle, // For warnings
  Paperclip, // For attachments
  Users, // For watchers/owner
  CheckCircle, // For complete button
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast'; // Assuming useToast hook exists

// --- Type Definitions (Ensure these match your actual types/todo.ts) ---
// (Included inline for completeness if types/todo.ts isn't provided, otherwise rely on import)
// interface Label { id: string; name: string; color: string; }
// interface Comment { text: string; author: string; }
// interface Attachment { url: string; filename: string; }
// interface SubTask { id: string; text: string; completed: boolean; /* other optional fields */ }
// interface Task { id: string; text: string; completed: boolean; priority?: 'low' | 'medium' | 'high'; description?: string; dueDate?: string | null; estimatedHours?: number; owner?: string; dependencies?: string[]; labels?: Label[]; comments?: Comment[]; attachments?: Attachment[]; watchers?: string[]; subTasks?: SubTask[]; }
// interface Section { id: string; name: string; goal?: string; priority?: string; tasks: Task[]; }
// interface Phase { id: string; name: string; objective?: string; priority?: string; dependsOn?: string[]; completed: boolean; sections: Section[]; }
// interface TodoData { phases: Phase[]; }

interface PhaseProgress {
  percentage: number;
  completed: number;
  total: number;
}

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
        // Recursively count subtasks only if the parent is NOT completed
        // Or adjust logic: always count subtasks regardless of parent status?
        // Current logic: counts all tasks/subtasks individually.
        countTasks(task.subTasks);
      }
    });
  };

  countTasks(items);

  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  // If there are no tasks, progress is 100% (or 0% depending on definition, 100% feels more intuitive for "nothing left to do")
  if (totalCount === 0) {
    return { completed: 0, total: 0, percentage: 100 };
  }

  return { completed: completedCount, total: totalCount, percentage };
};

// --- Helper Function to Update Task Status Recursively ---
const updateTaskStatus = (
  tasks: (Task | SubTask)[],
  taskId: string,
  completed: boolean
): (Task | SubTask)[] => {
  return tasks.map(task => {
    let updatedTask = { ...task }; // Shallow copy

    if (updatedTask.id === taskId) {
      updatedTask.completed = completed; // Update the target task
    }

    // Recursively update subtasks if they exist
    if (updatedTask.subTasks && updatedTask.subTasks.length > 0) {
      const updatedSubTasks = updateTaskStatus(updatedTask.subTasks, taskId, completed);
      // Only create a new object if subtasks actually changed
      if (updatedSubTasks !== updatedTask.subTasks) {
        updatedTask.subTasks = updatedSubTasks;
      }
    }

    // Return the original task if no changes occurred in it or its descendants
    // This helps React's reconciliation
    if (
      updatedTask.id === taskId ||
      (updatedTask.subTasks && updatedTask.subTasks !== task.subTasks)
    ) {
      return updatedTask;
    }

    return task; // Return original object if no change
  });
};

// --- Helper Component for Rendering Tasks (Handles Recursion and Details) ---
interface TaskItemProps {
  task: Task | SubTask;
  level?: number; // For indentation
  onToggleTask: (taskId: string, completed: boolean) => void; // Handler for toggling completion
}

const TaskItem: React.FC<TaskItemProps> = ({ task, level = 0, onToggleTask }) => {
  const [isExpanded, setIsExpanded] = useState(false); // State to control details visibility
  const hasDetails =
    task.description || task.comments?.length || task.attachments?.length || task.watchers?.length;
  const hasSubtasks = task.subTasks && task.subTasks.length > 0;

  // Use padding for indentation to align checkbox and content
  const indentClass = `pl-${level * 4}`; // e.g., pl-0, pl-4, pl-8

  const handleCheckedChange = (checked: boolean | 'indeterminate') => {
    onToggleTask(task.id, !!checked);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      console.error('Invalid date format:', dateString);
      return 'Invalid Date';
    }
  };

  // Determine if the task has any metadata to display inline
  const hasInlineMetadata =
    task.dueDate || task.estimatedHours || task.dependencies?.length || task.owner;

  return (
    <div
      className={cn(
        'task-item flex flex-col border-l-2', // Add left border for visual structure
        level > 0 ? 'border-muted-foreground/30 hover:bg-muted/20' : 'border-transparent', // Indent border only for subtasks
        'py-1.5 rounded-r-md', // Consistent padding and rounding
        indentClass // Apply indentation
      )}
    >
      {/* Main Task Row */}
      <div className="flex items-start gap-2 px-2">
        <Checkbox
          id={task.id}
          checked={task.completed}
          onCheckedChange={handleCheckedChange}
          aria-label={`Task ${task.completed ? 'completed' : 'pending'}: ${task.text}`}
          className="mt-1 flex-shrink-0" // Prevent checkbox from shrinking
        />
        <div className="flex-1 min-w-0">
          {' '}
          {/* Allow content to wrap */}
          {/* Task Text and Priority/Owner Badges */}
          <div className="flex items-start justify-between gap-2">
            <span
              className={cn(
                'text-sm font-medium break-words', // Allow text wrapping
                task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
              )}
            >
              {task.text}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              {task.priority && (
                <Badge
                  variant={
                    task.priority === 'high'
                      ? 'destructive'
                      : task.priority === 'medium'
                        ? 'default'
                        : 'secondary'
                  }
                  className="text-xs px-1.5 py-0.5" // Slightly smaller padding
                >
                  {task.priority}
                </Badge>
              )}
            </div>
          </div>
          {/* Inline Metadata (Date, Hours, Dependencies, Owner) */}
          {hasInlineMetadata && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
              {task.owner && (
                <span className="flex items-center gap-1" title={`Owner: ${task.owner}`}>
                  <Users className="h-3 w-3" />@{task.owner}
                </span>
              )}
              {task.dueDate && (
                <span
                  className="flex items-center gap-1"
                  title={`Due Date: ${formatDate(task.dueDate)}`}
                >
                  <CalendarIcon className="h-3 w-3" />
                  {formatDate(task.dueDate)}
                </span>
              )}
              {task.estimatedHours && (
                <span
                  className="flex items-center gap-1"
                  title={`Estimated: ${task.estimatedHours} hours`}
                >
                  <ClockIcon className="h-3 w-3" />
                  {task.estimatedHours}h
                </span>
              )}
              {task.dependencies?.length > 0 && (
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex items-center gap-1 cursor-default">
                        <LinkIcon className="h-3 w-3" />
                        {task.dependencies.length} dep{task.dependencies.length > 1 ? 's' : ''}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Dependencies: {task.dependencies.join(', ')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {task.labels.map(label => (
                <span
                  key={label.id}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${label.color}20`, color: label.color }} // Use label color with transparency
                  title={label.name}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Expand/Collapse Button */}
        {(hasDetails || hasSubtasks) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 flex-shrink-0 text-muted-foreground hover:text-foreground"
            aria-expanded={isExpanded}
            aria-controls={`task-details-${task.id}`}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="sr-only">{isExpanded ? 'Collapse' : 'Expand'} details</span>
          </Button>
        )}
      </div>

      {/* Collapsible Details and Subtasks Section */}
      {isExpanded && (
        <div id={`task-details-${task.id}`} className="pl-8 pr-2 pb-1 mt-1 space-y-3">
          {' '}
          {/* Indent details */}
          {/* Description */}
          {task.description && (
            <div className="text-xs text-muted-foreground border-l-2 border-dashed border-border pl-3 py-1">
              <p className="font-medium text-foreground mb-1">Description:</p>
              <p className="whitespace-pre-wrap">{task.description}</p> {/* Preserve whitespace */}
            </div>
          )}
          {/* Comments */}
          {task.comments && task.comments.length > 0 && (
            <div className="text-xs text-muted-foreground border-l-2 border-dashed border-border pl-3 py-1">
              <p className="font-medium text-foreground mb-1 flex items-center gap-1">
                <MessageSquareIcon className="h-3 w-3" /> Comments ({task.comments.length}):
              </p>
              <ul className="space-y-1">
                {task.comments.map((comment, index) => (
                  <li key={index} className="bg-muted/30 p-1 rounded text-foreground/80">
                    {comment.text}{' '}
                    <span className="text-muted-foreground/70">- @{comment.author}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="text-xs text-muted-foreground border-l-2 border-dashed border-border pl-3 py-1">
              <p className="font-medium text-foreground mb-1 flex items-center gap-1">
                <Paperclip className="h-3 w-3" /> Attachments ({task.attachments.length}):
              </p>
              <ul className="space-y-1">
                {task.attachments.map((att, index) => (
                  <li key={index}>
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                      title={att.filename}
                    >
                      {att.filename}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Watchers */}
          {task.watchers && task.watchers.length > 0 && (
            <div className="text-xs text-muted-foreground border-l-2 border-dashed border-border pl-3 py-1">
              <p className="font-medium text-foreground mb-1 flex items-center gap-1">
                <Users className="h-3 w-3" /> Watchers ({task.watchers.length}):
              </p>
              <div className="flex flex-wrap gap-1">
                {task.watchers.map((watcher, index) => (
                  <Badge key={index} variant="secondary" className="font-normal">
                    @{watcher}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {/* Recursively render subtasks */}
          {hasSubtasks && (
            <div className="subtasks mt-2 space-y-1">
              <p className="text-xs font-medium text-foreground mb-1">Sub-tasks:</p>
              {task.subTasks?.map(subTask => (
                <ErrorBoundary key={subTask.id} fallback={<p>Error loading subtask.</p>}>
                  <TaskItem
                    task={{
                      // Ensure all potential fields are passed down, even if empty/undefined in JSON
                      ...subTask,
                      priority: subTask.priority,
                      description: subTask.description,
                      dueDate: subTask.dueDate,
                      estimatedHours: subTask.estimatedHours,
                      owner: subTask.owner,
                      dependencies: subTask.dependencies || [],
                      labels: subTask.labels || [],
                      comments: subTask.comments || [],
                      attachments: subTask.attachments || [],
                      watchers: subTask.watchers || [],
                      subTasks: subTask.subTasks || [], // Handle nested subtasks
                    }}
                    level={level + 1} // Increase indent level
                    onToggleTask={onToggleTask}
                  />
                </ErrorBoundary>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Main Dashboard Component ---
const TODODashboard: React.FC = () => {
  const { toast } = useToast();
  // --- State Management ---
  const [tasksData, setTasksData] = useState<TodoData>(() => {
    // Basic validation could happen here if needed, but we trust the JSON structure for now
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

        // Double-check dependencies (although UI should prevent this call if unmet)
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

        // Check if all tasks within the phase are actually done
        const phaseProgress = calculateProgress(
          phaseToComplete.sections.flatMap(section => section.tasks)
        );
        if (phaseProgress.percentage < 100) {
          toast({
            title: 'Incomplete Tasks',
            description: `Cannot mark phase "${phaseToComplete.name}" as complete: ${phaseProgress.total - phaseProgress.completed} task(s) still pending.`,
            variant: 'warning',
          });
          return currentData;
        }

        // Proceed with marking the phase complete
        const updatedPhases = currentData.phases.map(phase =>
          phase.id === phaseId ? { ...phase, completed: true } : phase
        );

        toast({
          title: 'Phase Completed',
          description: `Phase "${phaseToComplete.name}" marked as complete.`,
          variant: 'success',
        });

        return { ...currentData, phases: updatedPhases };
      });
    },
    [toast] // Added toast as dependency
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
          return section;
        });

        if (phaseUpdated) {
          return { ...phase, sections: newSections };
        }
        return phase;
      });

      // Only update state if phases actually changed
      if (newPhases !== currentData.phases) {
        return { ...currentData, phases: newPhases };
      }
      return currentData;
    });
  }, []); // No dependencies needed

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
          {/* Overall progress could be added here */}
        </div>

        {/* Render Unlocked Phases */}
        {unlockedPhases.length > 0 ? (
          unlockedPhases.map((phase: Phase) => {
            // Calculate progress based on the current state for this phase
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
                {/* Card for Phase Details */}
                <Card className={cn(isPhaseComplete ? 'opacity-70 border-green-600/50' : '')}>
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {/* Phase Title and Priority */}
                      <CardTitle className="flex items-center gap-2 text-xl">
                        {phase.name}
                        {phase.priority && (
                          <Badge variant="secondary" className="text-xs font-medium">
                            {phase.priority}
                          </Badge>
                        )}
                        {/* Warning if phase marked complete but tasks remain (shouldn't happen with new logic, but good failsafe) */}
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

                      {/* Phase Progress Text & Complete Button */}
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
                    {/* Phase Objective */}
                    {phase.objective && (
                      <CardDescription className="flex items-start gap-2 pt-2 text-base">
                        <Target className="h-4 w-4 mt-1 flex-shrink-0 text-muted-foreground" />
                        <span>{phase.objective}</span>
                      </CardDescription>
                    )}
                    {/* Phase Progress Bar */}
                    <Progress
                      value={phaseProgressData.percentage}
                      className="mt-3 h-2"
                      aria-label={`Phase ${phase.name} progress: ${phaseProgressData.percentage}%`}
                    />
                  </CardHeader>
                  <CardContent className="space-y-5 pt-0">
                    {/* Sections within the Phase */}
                    {phase.sections.map((section: Section) => {
                      const sectionProgress = calculateProgress(section.tasks);
                      return (
                        <Accordion
                          key={section.id}
                          type="single"
                          collapsible
                          className="w-full border border-border rounded-lg overflow-hidden bg-card shadow-sm"
                          // Default open if section has pending tasks? Optional enhancement.
                          // defaultValue={sectionProgress.percentage < 100 ? `section-${section.id}` : undefined}
                        >
                          <AccordionItem value={`section-${section.id}`} className="border-b-0">
                            <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 text-left">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2 pr-2">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-base font-semibold">{section.name}</h3>
                                  {section.priority && (
                                    <Badge variant="outline" className="text-xs">
                                      {section.priority}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>
                                    {sectionProgress.completed}/{sectionProgress.total} (
                                    {sectionProgress.percentage}%)
                                  </span>
                                  <Progress
                                    value={sectionProgress.percentage}
                                    className="w-20 h-1.5"
                                    aria-label={`Section ${section.name} progress: ${sectionProgress.percentage}%`}
                                  />
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-0 pb-2">
                              <div className="section space-y-1 px-2">
                                {section.goal && (
                                  <p className="text-sm text-muted-foreground italic mb-3 px-2">
                                    Goal: {section.goal}
                                  </p>
                                )}
                                {/* Tasks within the Section */}
                                <div className="tasks space-y-0.5">
                                  {section.tasks.length > 0 ? (
                                    section.tasks.map((task: Task) => (
                                      <ErrorBoundary
                                        key={task.id}
                                        fallback={<p>Error loading task {task.text}.</p>}
                                      >
                                        <TaskItem
                                          task={{
                                            // Ensure all potential fields are passed down
                                            ...task,
                                            priority: task.priority,
                                            description: task.description,
                                            dueDate: task.dueDate,
                                            estimatedHours: task.estimatedHours,
                                            owner: task.owner,
                                            dependencies: task.dependencies || [],
                                            labels: task.labels || [],
                                            comments: task.comments || [],
                                            attachments: task.attachments || [],
                                            watchers: task.watchers || [],
                                            subTasks: task.subTasks || [],
                                          }}
                                          level={0} // Top-level tasks in a section
                                          onToggleTask={handleToggleTask}
                                        />
                                      </ErrorBoundary>
                                    ))
                                  ) : (
                                    <p className="text-sm text-muted-foreground px-2 py-4 text-center">
                                      No tasks in this section.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      );
                    })}
                  </CardContent>
                </Card>
              </ErrorBoundary>
            );
          })
        ) : (
          // Display message if no phases are unlocked or available
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p>No active phases available. Check dependencies or add phases to TODO.json.</p>
            </CardContent>
          </Card>
        )}

        {/* Display Locked Phases (Optional) */}
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
                          Requires completion of:{' '}
                          {lockedPhase.dependsOn?.join(', ') || 'Unknown'}
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
