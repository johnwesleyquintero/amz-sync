// src/pages/TODO-dashboard.tsx
import React, { useState, useCallback } from 'react'; // Import useState and useCallback
import todoDataJson from '../../TODO.json'; // Adjust the path as necessary
import type { TodoData, Phase, Section, Task, SubTask } from '../types/todo'; // Adjust path if needed
import MainLayout from '@/components/layout/MainLayout'; // Import MainLayout
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card components
import { Checkbox } from '@/components/ui/checkbox'; // Import shadcn Checkbox
import { Badge } from '@/components/ui/badge'; // Import Badge
import { Progress } from '@/components/ui/progress'; // Import Progress
import { cn } from '@/lib/utils'; // Import cn utility
import { Target, ListChecks } from 'lucide-react'; // Import icons

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

  return (
    <div className={cn('task-item flex items-start gap-2 py-1', indentClass)}>
      <Checkbox
        id={task.id}
        checked={task.completed}
        // Remove the disabled prop to make it interactive
        // disabled
        onCheckedChange={handleCheckedChange} // Add the change handler
        aria-label={`Task ${task.completed ? 'completed' : 'pending'}: ${task.text}`}
        className="mt-1"
      />
      <div className="flex-1">
        {/* Use a standard div instead of label for better click handling on checkbox */}
        <div
          className={cn(
            'text-sm font-medium leading-none', // Basic styles
            task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
          )}
        >
          {task.text}
        </div>
        {task.owner && (
          <Badge variant="outline" className="ml-2 text-xs font-normal">
            @{task.owner}
          </Badge>
        )}
        {/* Recursively render subtasks, passing down the handler */}
        {task.subTasks && task.subTasks.length > 0 && (
          <div className="subtasks mt-2">
            {task.subTasks.map(subTask => (
              <TaskItem
                key={subTask.id}
                task={subTask}
                level={level + 1}
                onToggleTask={onToggleTask} // Pass handler down
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---
const TODODashboard: React.FC = () => {
  // --- State Management ---
  // Initialize state with the data from the JSON file
  const [tasksData, setTasksData] = useState<TodoData>(todoDataJson as TodoData);

  // --- Immutable Update Function ---
  // Recursively finds and updates the status of a task/subtask
  const updateTaskStatus = (
    tasks: (Task | SubTask)[],
    taskId: string,
    completed: boolean
  ): (Task | SubTask)[] => {
    return tasks.map(task => {
      if (task.id === taskId) {
        // Found the task, return a new object with updated status
        return { ...task, completed };
      }
      if (task.subTasks && task.subTasks.length > 0) {
        // Recursively check subtasks
        const updatedSubTasks = updateTaskStatus(task.subTasks, taskId, completed);
        // If subtasks were updated, return a new parent task object
        if (updatedSubTasks !== task.subTasks) {
          return { ...task, subTasks: updatedSubTasks };
        }
      }
      // If not the task and no subtasks were updated, return the original task
      return task;
    });
  };

  // --- Toggle Handler ---
  // Passed down to TaskItem components
  const handleToggleTask = useCallback((taskId: string, completed: boolean) => {
    setTasksData(currentData => {
      // Create a new top-level structure
      const newPhases = currentData.phases.map(phase => {
        // Create new sections within the phase
        const newSections = phase.sections.map(section => {
          // Update tasks within the section using the recursive helper
          const updatedTasks = updateTaskStatus(section.tasks, taskId, completed);
          // If tasks changed, return a new section object
          if (updatedTasks !== section.tasks) {
            return { ...section, tasks: updatedTasks };
          }
          return section; // Otherwise, return the original section
        });
        // If sections changed, return a new phase object
        if (newSections !== phase.sections) {
          return { ...phase, sections: newSections };
        }
        return phase; // Otherwise, return the original phase
      });

      // If phases changed, return a new data object
      if (newPhases !== currentData.phases) {
        return { ...currentData, phases: newPhases };
      }
      return currentData; // Otherwise, return the original data (no change needed)
    });
    // Note: Progress bars will automatically update on re-render due to state change
  }, []); // No dependencies needed for this specific useCallback

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
                          <TaskItem
                            key={task.id}
                            task={task}
                            level={0}
                            onToggleTask={handleToggleTask} // Pass the handler down
                          />
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
