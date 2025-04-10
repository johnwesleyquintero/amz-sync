// src/pages/TODO-dashboard.tsx
import React, { useState, useCallback, useMemo } from 'react';
import todoDataJson from '../../TODO.json';
import type { TodoData, Phase, Section, Task, SubTask } from '../types/todo';
import MainLayout from '@/components/layout/MainLayout';
import { PhaseComponent } from '@/components/ui/phase-component'; // Assuming this component handles phase display logic
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button'; // Import Button
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'; // Import Accordion
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
  Users, // For watchers
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Attachment {
  url: string;
  filename: string;
}

interface PhaseProgress {
  percentage: number;
  completed: number;
  total: number;
}
interface PhaseWithProgress extends Phase {
  progress: number;
  completed: boolean;
}

// --- Helper Function to Calculate Progress ---
// Calculates completion progress for a list of tasks and their subtasks recursively.
const calculateProgress = (
  items: (Task | SubTask)[]
): { completed: number; total: number; percentage: number } => {
  let completedCount = 0;
  let totalCount = 0;

  const countTasks = (tasks: (Task | SubTask)[]) => {
    tasks.forEach(task => {
      // Count the task itself only if it's not just a container for subtasks
      // Or adjust logic if parent tasks should auto-complete based on children
      totalCount++;
      if (task.completed) {
        completedCount++;
      }
      // Recursively count subtasks
      if (task.subTasks && task.subTasks.length > 0) {
        countTasks(task.subTasks);
      }
    });
  };

  countTasks(items);

  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  return { completed: completedCount, total: totalCount, percentage };
};

// --- Helper Function to Update Task Status Recursively ---
// Finds a task by ID within a nested structure and updates its completed status.
const updateTaskStatus = (
  tasks: (Task | SubTask)[],
  taskId: string,
  completed: boolean
): (Task | SubTask)[] => {
  return tasks.map(task => {
    if (task.id === taskId) {
      // Update the target task
      return { ...task, completed };
    }
    // If the task has subtasks, recursively update them
    if (task.subTasks && task.subTasks.length > 0) {
      const updatedSubTasks = updateTaskStatus(task.subTasks, taskId, completed);
      // If subtasks were updated, return the task with updated subtasks
      if (updatedSubTasks !== task.subTasks) {
        return { ...task, subTasks: updatedSubTasks };
      }
    }
    // Otherwise, return the task as is
    return task;
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
  const indentClass = `pl-${level * 4}`; // Adjusted padding level

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
                <span
                  className="flex items-center gap-1"
                  title={`${task.dependencies.length} dependencies`}
                >
                  <LinkIcon className="h-3 w-3" />
                  {task.dependencies.length} deps
                </span>
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
                      // Ensure all potential fields are passed down, even if empty
                      ...subTask,
                      labels: subTask.labels || [],
                      comments: subTask.comments || [],
                      dependencies: subTask.dependencies || [],
                      attachments: subTask.attachments || [],
                      watchers: subTask.watchers || [],
                      subTasks: subTask.subTasks || [],
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
  // Initialize state with data from JSON, ensuring type safety.
  const [tasksData, setTasksData] = useState<TodoData>(() => {
    // Basic validation or transformation could happen here if needed
    return todoDataJson as TodoData;
  });

  // --- Memoized Phase Dependencies ---
  // Calculate which phases are unlocked based on dependencies and completion status.
  const unlockedPhases = useMemo(() => {
    const completedPhaseIds = new Set(tasksData.phases.filter(p => p.completed).map(p => p.id));
    return tasksData.phases.filter(
      phase => phase.dependsOn?.every(depId => completedPhaseIds.has(depId)) ?? true
    );
  }, [tasksData.phases]);

  // --- Phase Completion Handler ---
  // Marks a phase as complete, checking dependencies first.
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
            description: `Cannot complete phase "${phaseToComplete.name}": Not all prerequisite phases are marked as complete.`,
            variant: 'destructive',
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
  // Toggles the completion status of a specific task using the recursive helper.
  const handleToggleTask = useCallback(
    (taskId: string, completed: boolean) => {
      setTasksData(currentData => {
        // Map through phases to find and update the relevant section/task
        const newPhases = currentData.phases.map(phase => {
          let phaseUpdated = false;
          const newSections = phase.sections.map(section => {
            // Use the recursive update function
            const updatedTasks = updateTaskStatus(section.tasks, taskId, completed);
            // Check if the tasks array actually changed
            if (updatedTasks !== section.tasks) {
              phaseUpdated = true; // Mark that an update occurred in this phase
              return { ...section, tasks: updatedTasks };
            }
            return section;
          });

          // If sections were updated, return the phase with updated sections
          if (phaseUpdated) {
            return { ...phase, sections: newSections };
          }
          return phase; // Otherwise, return the original phase
        });

        // Only update state if phases actually changed
        if (newPhases !== currentData.phases) {
          return { ...currentData, phases: newPhases };
        }
        return currentData; // Return original state if no changes
      });
    },
    [] // No dependencies needed
  );

  // --- Rendering ---
  return (
    <MainLayout>
      <div className="todo-dashboard p-4 md:p-6 space-y-8 animate-fade-in">
        {' '}
        {/* Increased spacing */}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div className="flex items-center gap-3">
            <ListChecks className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Project TODO Dashboard</h1>
          </div>
          {/* Maybe add overall progress or filters here later */}
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
            const hasIncompleteTasks = phaseProgress.percentage < 100;
            return (
              <ErrorBoundary key={phase.id} fallback={<p>Error loading phase.</p>}>
                <PhaseComponent
                  key={phase.id} // Key moved to PhaseComponent
                  phase={{
                    ...phase,
                    progress: phaseProgress.percentage,
                    completed: isPhaseComplete, // Use the actual completed status
                  }}
                  onComplete={handlePhaseComplete}
                  onToggleTask={handleToggleTask}
                >
                  {/* Card for Phase Details */}
                  <Card className={cn(isPhaseComplete ? 'opacity-70' : '')}>
                    {' '}
                    {/* Dim completed phases slightly */}
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
                          {/* Warning if phase marked complete but tasks remain */}
                          {isPhaseComplete && hasIncompleteTasks && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Phase marked complete, but some tasks are pending.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </CardTitle>
                        {/* Phase Progress Text */}
                        <span className="text-sm text-muted-foreground">
                          {phaseProgressData.completed} / {phaseProgressData.total} tasks done (
                          {phaseProgressData.percentage}%)
                        </span>
                      </div>
                      {/* Phase Objective */}
                      {phase.objective && (
                        <CardDescription className="flex items-start gap-2 pt-2 text-base">
                          {' '}
                          {/* Slightly larger description */}
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
                      {' '}
                      {/* Remove default top padding */}
                      {/* Sections within the Phase */}
                      {phase.sections.map((section: Section) => {
                        // Calculate progress for this section based on current state
                        const sectionProgress = calculateProgress(section.tasks);
                        return (
                          <Accordion
                            key={section.id}
                            type="single"
                            collapsible
                            className="w-full border border-border rounded-lg overflow-hidden bg-card shadow-sm"
                          >
                            <AccordionItem value={`section-${section.id}`} className="border-b-0">
                              <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 text-left">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2 pr-2">
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-base font-semibold">
                                      {' '}
                                      {/* Slightly smaller section title */}
                                      {section.name}
                                    </h3>
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
                                {' '}
                                {/* Remove padding for content */}
                                <div className="section space-y-1 px-2">
                                  {' '}
                                  {/* Add padding inside content */}
                                  {section.goal && (
                                    <p className="text-sm text-muted-foreground italic mb-3 px-2">
                                      Goal: {section.goal}
                                    </p>
                                  )}
                                  {/* Tasks within the Section */}
                                  <div className="tasks space-y-0.5">
                                    {' '}
                                    {/* Reduced space between tasks */}
                                    {section.tasks.length > 0 ? (
                                      section.tasks.map((task: Task) => (
                                        <ErrorBoundary
                                          key={task.id}
                                          fallback={<p>Error loading task.</p>}
                                        >
                                          <TaskItem
                                            task={{
                                              // Ensure all potential fields are passed down
                                              ...task,
                                              labels: task.labels || [],
                                              comments: task.comments || [],
                                              dependencies: task.dependencies || [],
                                              attachments: task.attachments || [],
                                              watchers: task.watchers || [],
                                              subTasks: task.subTasks || [],
                                            }}
                                            level={0} // Top-level tasks in a section
                                            onToggleTask={handleToggleTask} // Pass the toggle handler
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
                </PhaseComponent>
              </ErrorBoundary>
            );
          })
        ) : (
          // Display message if no phases are unlocked or available
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p>No phases available to display. Check dependencies or add phases to TODO.json.</p>
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
                  <div
                    key={lockedPhase.id}
                    className="text-sm text-muted-foreground p-2 border rounded bg-muted/30"
                  >
                    {lockedPhase.name} - (Requires: {lockedPhase.dependsOn?.join(', ') || 'None'})
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default TODODashboard;
