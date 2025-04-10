Okay, let's enhance the TODO-dashboard.tsx and related PhaseComponent.tsx.

The main goals of this enhancement are:

Encapsulation: Move the rendering logic for a phase's content (sections, tasks) into the PhaseComponent, making TODODashboard cleaner.
Props Drilling: Pass the onToggleTask handler down to PhaseComponent and then to TaskItem.
UX Improvement: Replace the alert with a toast notification for unmet dependencies.
Clarity & Consistency: Improve minor styling, add tooltips, and ensure the "Complete Phase" button logic is clear.
Type Alignment: Ensure the PhaseComponent uses the same field names as the Phase type derived from TODO.json (e.g., name, objective).
Summary of Changes:

TODODashboard.tsx:

Removed the direct rendering of Card, Accordion, TaskItem etc., within the unlockedPhases.map loop.
The loop now simply renders the enhanced PhaseComponent, passing phase, onComplete, and onToggleTask as props.
Added useToast hook from @/hooks/use-toast (assuming it's set up based on shadcn/ui).
Replaced the alert in handlePhaseComplete with toast() for better UX when dependencies are not met.
Removed the redundant nested <PhaseComponent> wrapper inside the loop.
Removed the PhaseProgress interface as progress calculation is now handled within PhaseComponent.
PhaseComponent.tsx (Enhanced):

Updated the Phase interface import to match the structure likely used in TODO.json (using name, objective, etc.).
Added onToggleTask to the component's props.
Integrated the rendering logic for sections (using Accordion) and tasks (using TaskItem) directly within PhaseComponent's CardContent.
Calculates phase and section progress inside the component based on the received phase prop.
Passes the onToggleTask handler down to each TaskItem.
Added a warning Tooltip next to the phase title if the phase is marked complete but has pending tasks.
Adjusted the "Complete Phase" button: It's now enabled if the phase is not complete (!phase.completed). Clicking it triggers the onComplete handler (which contains the dependency check).
Uses TaskItem (assumed to be correctly defined as in the original TODO-dashboard.tsx) for rendering individual tasks and subtasks.
Added Target icon for the objective.
TaskItem (Conceptual - No changes needed from original TODO-dashboard.tsx):

The TaskItem component provided within the original TODO-dashboard.tsx is well-structured for recursive rendering and displaying details. It's assumed this component is either moved to its own file or kept within PhaseComponent (or imported) and used as is.
Improved Code:

1. c:\Users\johnw\OneDrive\Desktop\amazon-insights-sync\src\pages\TODO-dashboard.tsx (Updated)

typescriptreact
import React, { useState, useCallback, useMemo } from 'react';
import todoDataJson from '../../TODO.json';
import type { TodoData, Phase as PhaseType, Section, Task, SubTask } from '../types/todo'; // Renamed Phase to PhaseType to avoid conflict
import MainLayout from '@/components/layout/MainLayout';
import { PhaseComponent } from '@/components/ui/phase-component'; // Use the enhanced PhaseComponent
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { ListChecks } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';

// --- Helper Function to Update Task Status Recursively ---
// Finds a task by ID within a nested structure and updates its completed status.
// (Keep this helper function as it's used by the handler)
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
const { toast } = useToast(); // Initialize toast

// --- State Management ---
const [tasksData, setTasksData] = useState<TodoData>(() => {
// Basic validation or transformation could happen here if needed
return todoDataJson as TodoData;
});

// --- Memoized Phase Dependencies ---
const unlockedPhases = useMemo(() => {
const completedPhaseIds = new Set(
tasksData.phases.filter(p => p.completed).map(p => p.id)
);
const unlocked = tasksData.phases.filter(phase =>
phase.dependsOn?.every(depId => completedPhaseIds.has(depId)) ?? true
);
// console.log("Completed IDs:", completedPhaseIds);
// console.log("Unlocked Phases:", unlocked.map(p => p.id));
return unlocked;
}, [tasksData.phases]);

// --- Phase Completion Handler ---
const handlePhaseComplete = useCallback((phaseId: string) => {
setTasksData(currentData => {
const phaseToComplete = currentData.phases.find(p => p.id === phaseId);
if (!phaseToComplete) return currentData;

      // Check if all dependencies are met
      const allDepsMet = phaseToComplete.dependsOn?.every(depId =>
        currentData.phases.find(p => p.id === depId)?.completed
      ) ?? true;

      if (!allDepsMet) {
        toast({ // Use toast notification
          title: "Dependency Error",
          description: `Cannot complete phase "${phaseToComplete.name}": Not all prerequisite phases are marked as complete.`,
          variant: "destructive",
        });
        return currentData; // Return current state if dependencies not met
      }

      // Update the specific phase's completed status
      const updatedPhases = currentData.phases.map(phase =>
        phase.id === phaseId ? { ...phase, completed: true } : phase
      );

      // Trigger toast notification for successful completion
      toast({
        title: "Phase Completed",
        description: `Phase "${phaseToComplete.name}" marked as complete.`,
      });


      return { ...currentData, phases: updatedPhases };
    });

}, [toast]); // Add toast to dependencies

// --- Task Toggle Handler ---
const handleToggleTask = useCallback(
(taskId: string, completed: boolean) => {
setTasksData(currentData => {
const newPhases = currentData.phases.map(phase => {
let phaseUpdated = false;
const newSections = phase.sections.map(section => {
const updatedTasks = updateTaskStatus(section.tasks, taskId, completed);
if (updatedTasks !== section.tasks) {
phaseUpdated = true;
return { ...section, tasks: updatedTasks as Task[] }; // Ensure type consistency
}
return section;
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
    },
    []

);

// --- Rendering ---
return (
<MainLayout>

<div className="todo-dashboard p-4 md:p-6 space-y-6 animate-fade-in"> {/_ Adjusted spacing _/}
{/_ Header _/}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
<div className='flex items-center gap-3'>
<ListChecks className="h-7 w-7 text-primary" />
<h1 className="text-3xl font-bold tracking-tight">Project TODO Dashboard</h1>
</div>
{/_ Overall progress or filters could go here _/}
</div>

        {/* Render Unlocked Phases */}
        {unlockedPhases.length > 0 ? (
          unlockedPhases.map((phase: PhaseType) => (
            <ErrorBoundary key={phase.id} fallback={<p>Error loading phase {phase.name}.</p>}>
              <PhaseComponent
                phase={phase} // Pass the full phase data
                onComplete={handlePhaseComplete} // Pass the completion handler
                onToggleTask={handleToggleTask} // Pass the task toggle handler
              />
            </ErrorBoundary>
          ))
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
             <h2 className="text-lg font-semibold text-muted-foreground mb-3">Locked Phases (Dependencies Not Met)</h2>
             <div className="space-y-2">
               {tasksData.phases
                 .filter(p => !unlockedPhases.some(up => up.id === p.id))
                 .map(lockedPhase => (
                   <div key={lockedPhase.id} className="text-sm text-muted-foreground p-3 border rounded bg-muted/30 shadow-sm">
                     <span className='font-medium text-foreground'>{lockedPhase.name}</span> - (Requires: {lockedPhase.dependsOn?.map(depId => tasksData.phases.find(p => p.id === depId)?.name || depId).join(', ') || 'None'})
                   </div>
               ))}
             </div>
           </div>
        )}
      </div>
    </MainLayout>

);
};

export default TODODashboard; 2. c:\Users\johnw\OneDrive\Desktop\amazon-insights-sync\src\components\ui\phase-component.tsx (Enhanced)

typescriptreact
import React, { useState } from 'react'; // Import React and useState
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox'; // Import Checkbox
import { Badge } from '@/components/ui/badge'; // Import Badge
import {
Accordion,
AccordionContent,
AccordionItem,
AccordionTrigger,
} from '@/components/ui/accordion'; // Import Accordion
import {
Tooltip,
TooltipContent,
TooltipProvider,
TooltipTrigger,
} from "@/components/ui/tooltip"; // Import Tooltip
import { cn } from '@/lib/utils'; // Import cn utility
import ErrorBoundary from '@/components/ErrorBoundary'; // Import ErrorBoundary
import {
CheckCircle2,
Target,
Calendar as CalendarIcon,
Clock as ClockIcon,
Link as LinkIcon,
MessageSquare as MessageSquareIcon,
ChevronDown,
ChevronRight,
AlertTriangle,
Paperclip,
Users,
} from 'lucide-react';

// --- Interfaces (Aligned with TODO.json structure) ---

interface Label {
id: string;
name: string;
color: string;
}

interface Comment {
author: string;
text: string;
}

interface Attachment {
url: string;
filename: string;
}

interface SubTask {
id: string;
text: string;
completed: boolean;
description?: string;
priority?: 'low' | 'medium' | 'high';
dueDate?: string | null;
estimatedHours?: number;
owner?: string;
labels?: Label[];
comments?: Comment[];
dependencies?: string[];
attachments?: Attachment[];
watchers?: string[];
subTasks?: SubTask[]; // Recursive definition
}

export interface Task extends SubTask {
// Task specific properties can be added here if any
}

export interface Section {
id: string;
name: string; // Use 'name' instead of 'title'
goal?: string;
priority?: 'low' | 'medium' | 'high';
tasks: Task[];
}

export interface Phase {
id: string;
name: string; // Use 'name' instead of 'title'
objective?: string; // Use 'objective' instead of 'description'
priority?: 'low' | 'medium' | 'high';
completed: boolean;
sections: Section[];
dependsOn?: string[];
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
countTasks(task.subTasks);
}
});
};

countTasks(items);

const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) \* 100) : 0;
return { completed: completedCount, total: totalCount, percentage };
};

// --- TaskItem Component (Copied from original TODO-dashboard for encapsulation) ---
interface TaskItemProps {
task: Task | SubTask;
level?: number;
onToggleTask: (taskId: string, completed: boolean) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, level = 0, onToggleTask }) => {
const [isExpanded, setIsExpanded] = useState(false);
const hasDetails = task.description || task.comments?.length || task.attachments?.length || task.watchers?.length;
const hasSubtasks = task.subTasks && task.subTasks.length > 0;
const indentClass = `pl-${level * 4}`;

const handleCheckedChange = (checked: boolean | 'indeterminate') => {
onToggleTask(task.id, !!checked);
};

const formatDate = (dateString: string | null | undefined) => {
if (!dateString) return null;
try {
return new Date(dateString).toLocaleDateString(undefined, {
year: 'numeric', month: 'short', day: 'numeric',
});
} catch (e) {
console.error('Invalid date format:', dateString); return 'Invalid Date';
}
};

const hasInlineMetadata = task.dueDate || task.estimatedHours || task.dependencies?.length || task.owner;

return (

<div
className={cn(
'task-item flex flex-col border-l-2',
level > 0 ? 'border-muted-foreground/30 hover:bg-muted/20' : 'border-transparent',
'py-1.5 rounded-r-md',
indentClass
)} >
<div className="flex items-start gap-2 px-2">
<Checkbox
id={task.id}
checked={task.completed}
onCheckedChange={handleCheckedChange}
aria-label={`Task ${task.completed ? 'completed' : 'pending'}: ${task.text}`}
className="mt-1 flex-shrink-0"
/>
<div className="flex-1 min-w-0">
<div className="flex items-start justify-between gap-2">
<span
className={cn(
'text-sm font-medium break-words',
task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
)} >
{task.text}
</span>
<div className="flex items-center gap-1 flex-shrink-0 ml-2">
{task.priority && (
<Badge
variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
className="text-xs px-1.5 py-0.5" >
{task.priority}
</Badge>
)}
</div>
</div>

          {hasInlineMetadata && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
              {task.owner && (
                <span className="flex items-center gap-1" title={`Owner: ${task.owner}`}>
                  <Users className="h-3 w-3" /> @{task.owner}
                </span>
              )}
              {task.dueDate && (
                <span className="flex items-center gap-1" title={`Due Date: ${formatDate(task.dueDate)}`}>
                  <CalendarIcon className="h-3 w-3" /> {formatDate(task.dueDate)}
                </span>
              )}
              {task.estimatedHours && (
                <span className="flex items-center gap-1" title={`Estimated: ${task.estimatedHours} hours`}>
                  <ClockIcon className="h-3 w-3" /> {task.estimatedHours}h
                </span>
              )}
              {task.dependencies?.length > 0 && (
                 <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center gap-1 cursor-help">
                          <LinkIcon className="h-3 w-3" /> {task.dependencies.length} deps
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

          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {task.labels.map(label => (
                <span
                  key={label.id}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${label.color}20`, color: label.color }}
                  title={label.name}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {(hasDetails || hasSubtasks) && (
          <Button
            variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 flex-shrink-0 text-muted-foreground hover:text-foreground"
            aria-expanded={isExpanded} aria-controls={`task-details-${task.id}`}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="sr-only">{isExpanded ? 'Collapse' : 'Expand'} details</span>
          </Button>
        )}
      </div>

      {isExpanded && (
        <div id={`task-details-${task.id}`} className="pl-8 pr-2 pb-1 mt-1 space-y-3">
          {task.description && (
            <div className="text-xs text-muted-foreground border-l-2 border-dashed border-border pl-3 py-1">
              <p className="font-medium text-foreground mb-1">Description:</p>
              <p className="whitespace-pre-wrap">{task.description}</p>
            </div>
          )}
          {task.comments && task.comments.length > 0 && (
            <div className="text-xs text-muted-foreground border-l-2 border-dashed border-border pl-3 py-1">
              <p className="font-medium text-foreground mb-1 flex items-center gap-1">
                <MessageSquareIcon className="h-3 w-3" /> Comments ({task.comments.length}):
              </p>
              <ul className="space-y-1">
                {task.comments.map((comment, index) => (
                  <li key={index} className="bg-muted/30 p-1 rounded text-foreground/80">
                    {comment.text} <span className="text-muted-foreground/70">- @{comment.author}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {task.attachments && task.attachments.length > 0 && (
            <div className="text-xs text-muted-foreground border-l-2 border-dashed border-border pl-3 py-1">
              <p className="font-medium text-foreground mb-1 flex items-center gap-1">
                <Paperclip className="h-3 w-3" /> Attachments ({task.attachments.length}):
              </p>
              <ul className="space-y-1">
                {task.attachments.map((att, index) => (
                  <li key={index} >
                    <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" title={att.filename}>
                      {att.filename}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {task.watchers && task.watchers.length > 0 && (
            <div className="text-xs text-muted-foreground border-l-2 border-dashed border-border pl-3 py-1">
              <p className="font-medium text-foreground mb-1 flex items-center gap-1">
                <Users className="h-3 w-3" /> Watchers ({task.watchers.length}):
              </p>
              <div className="flex flex-wrap gap-1">
                {task.watchers.map((watcher, index) => (
                   <Badge key={index} variant="secondary" className="font-normal">@{watcher}</Badge>
                ))}
              </div>
            </div>
          )}
          {hasSubtasks && (
            <div className="subtasks mt-2 space-y-1">
              <p className="text-xs font-medium text-foreground mb-1">Sub-tasks:</p>
              {task.subTasks?.map(subTask => (
                <ErrorBoundary key={subTask.id} fallback={<p>Error loading subtask.</p>}>
                  <TaskItem
                    task={{ // Pass down all potential fields
                      ...subTask,
                      labels: subTask.labels || [], comments: subTask.comments || [],
                      dependencies: subTask.dependencies || [], attachments: subTask.attachments || [],
                      watchers: subTask.watchers || [], subTasks: subTask.subTasks || [],
                    }}
                    level={level + 1}
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

// --- PhaseComponent ---
export function PhaseComponent({
phase,
onComplete,
onToggleTask, // Added handler prop
}: {
phase: Phase;
onComplete: (phaseId: string) => void;
onToggleTask: (taskId: string, completed: boolean) => void; // Added handler type
}) {
// Calculate overall phase progress
const phaseProgress = calculateProgress(phase.sections.flatMap(section => section.tasks));
const hasIncompleteTasks = phaseProgress.percentage < 100;

return (
<Card className={cn("mb-6", phase.completed ? 'opacity-70' : '')}> {/_ Dim completed phases _/}
<CardHeader className="pb-4"> {/_ Adjusted padding _/}

<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
{/_ Phase Title, Priority, and Status Icon/Warning _/}
<div className="flex items-center gap-2 flex-1 min-w-0">
<CardTitle className="text-xl font-semibold"> {/_ Adjusted size/weight _/}
{phase.name}
</CardTitle>
{phase.priority && (
<Badge variant="secondary" className="text-xs font-medium">
{phase.priority}
</Badge>
)}
{phase.completed ? (
<TooltipProvider>
<Tooltip>
<TooltipTrigger>
<CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
</TooltipTrigger>
<TooltipContent>
<p>Phase marked as complete.</p>
</TooltipContent>
</Tooltip>
</TooltipProvider>
) : null}
{/_ Warning if phase marked complete but tasks remain _/}
{phase.completed && hasIncompleteTasks && (
<TooltipProvider>
<Tooltip>
<TooltipTrigger>
<AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
</TooltipTrigger>
<TooltipContent>
<p>Phase marked complete, but some tasks are pending.</p>
</TooltipContent>
</Tooltip>
</TooltipProvider>
)}
</div>

          {/* Complete Button */}
          {!phase.completed && (
             <Button size="sm" onClick={() => onComplete(phase.id)}>
               Mark Phase Complete
             </Button>
           )}
        </div>

        {/* Phase Objective */}
        {phase.objective && (
          <CardDescription className="flex items-start gap-2 pt-2 text-base">
            <Target className="h-4 w-4 mt-1 flex-shrink-0 text-muted-foreground" />
            <span>{phase.objective}</span>
          </CardDescription>
        )}

        {/* Phase Progress Bar and Text */}
        <div className="mt-3 space-y-1">
           <Progress value={phaseProgress.percentage} className="h-2" aria-label={`Phase ${phase.name} progress: ${phaseProgress.percentage}%`} />
           <div className="text-sm text-muted-foreground text-right">
             {phaseProgress.completed} / {phaseProgress.total} tasks done ({phaseProgress.percentage}%)
           </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0"> {/* Adjusted spacing and padding */}
        {/* Sections within the Phase */}
        {phase.sections.map(section => {
          const sectionProgress = calculateProgress(section.tasks);
          return (
            <Accordion key={section.id} type="single" collapsible defaultValue={`section-${section.id}`} className="w-full border border-border rounded-lg overflow-hidden bg-card shadow-sm">
              <AccordionItem value={`section-${section.id}`} className="border-b-0">
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2 pr-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold">
                        {section.name}
                      </h3>
                      {section.priority && (
                        <Badge variant="outline" className="text-xs">
                          {section.priority}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{sectionProgress.completed}/{sectionProgress.total} ({sectionProgress.percentage}%)</span>
                      <Progress value={sectionProgress.percentage} className="w-20 h-1.5" aria-label={`Section ${section.name} progress: ${sectionProgress.percentage}%`} />
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
                    <div className="tasks space-y-0.5">
                      {section.tasks.length > 0 ? (
                        section.tasks.map(task => (
                          <ErrorBoundary key={task.id} fallback={<p>Error loading task.</p>}>
                            <TaskItem
                              task={{ // Ensure all potential fields are passed down
                                ...task,
                                labels: task.labels || [], comments: task.comments || [],
                                dependencies: task.dependencies || [], attachments: task.attachments || [],
                                watchers: task.watchers || [], subTasks: task.subTasks || [],
                              }}
                              level={0}
                              onToggleTask={onToggleTask} // Pass the handler down
                            />
                          </ErrorBoundary>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground px-2 py-4 text-center">No tasks in this section.</p>
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

);
}
To make this fully work:

Install useToast: Ensure you have the useToast hook set up correctly in your project, typically part of the shadcn/ui installation (hooks/use-toast.ts and components/ui/toaster.tsx). Make sure <Toaster /> is included in your main layout or App.tsx.
TODO.json Structure: Verify that your TODO.json file matches the updated Phase, Section, Task, SubTask interfaces used in phase-component.tsx (e.g., using name for phases/sections, objective for phases).
Type Definitions: Ensure your src/types/todo.d.ts (or wherever TodoData, Phase, etc. are defined) matches the structure expected by the components and the JSON data.
Tailwind Configuration: Ensure your tailwind.config.js is set up to handle dynamic classes like pl-${level \* 4} if you haven't already configured safelist or if JIT mode isn't picking them up reliably (though it usually does).
This refactoring significantly cleans up the TODODashboard component, making it primarily responsible for state management and passing data/handlers down, while PhaseComponent now correctly encapsulates the display logic for a single phase and its contents.
