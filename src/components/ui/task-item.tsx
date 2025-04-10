import { cn } from '@/lib/styling-utils';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { Task } from '@/types/todo';

export interface TaskItemProps {
  task: Task;
  onToggle?: (taskId: string) => void;
  className?: string;
}

export const TaskItem = ({ task, onToggle, className }: TaskItemProps) => (
  <div className={cn('flex items-center gap-3 p-2 hover:bg-accent/50', className)}>
    <button
      onClick={() => onToggle?.(task.id)}
      className="flex items-center gap-2 flex-1 text-left"
      aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
    >
      <CheckCircle2
        className={cn('h-5 w-5', task.completed ? 'text-green-500' : 'text-muted-foreground')}
      />
      <span className={cn(task.completed && 'line-through text-muted-foreground')}>
        {task.title}
      </span>
    </button>
    {task.isCritical && <AlertTriangle className="h-4 w-4 text-yellow-500" aria-hidden="true" />}
  </div>
);
