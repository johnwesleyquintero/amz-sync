import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import ErrorBoundary from '@/components/ErrorBoundary';
import { CheckCircle2, Target, AlertTriangle } from 'lucide-react';
import { TaskItem } from '@/components/ui/task-item';

interface PhaseProps {
  phase: {
    id: string;
    name: string;
    objective?: string;
    priority?: 'low' | 'medium' | 'high';
    completed: boolean;
    sections: {
      id: string;
      name: string;
      tasks: any[];
    }[];
  };
  onComplete: (phaseId: string) => void;
  onToggleTask: (taskId: string, completed: boolean) => void;
}

export const PhaseComponent: React.FC<PhaseProps> = ({ phase, onComplete, onToggleTask }) => {
  const calculateProgress = (tasks: any[]) => {
    const total = tasks.flatMap(t => t.subTasks || []).length + tasks.length;
    const completed =
      tasks.filter(t => t.completed).length +
      tasks.flatMap(t => t.subTasks?.filter((st: any) => st.completed) || []).length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <Card className={cn(phase.completed ? 'opacity-70' : '')}>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            {phase.name}
            {phase.priority && (
              <Badge
                variant={
                  phase.priority === 'high'
                    ? 'destructive'
                    : phase.priority === 'medium'
                      ? 'default'
                      : 'secondary'
                }
              >
                {phase.priority}
              </Badge>
            )}
            {phase.completed && calculateProgress(phase.sections.flatMap(s => s.tasks)) < 100 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </TooltipTrigger>
                  <TooltipContent>Phase marked complete but has pending tasks</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardTitle>
          <div className="flex items-center gap-4">
            <Progress
              value={calculateProgress(phase.sections.flatMap(s => s.tasks))}
              className="w-32"
            />
            {!phase.completed && (
              <Button size="sm" onClick={() => onComplete(phase.id)}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Complete Phase
              </Button>
            )}
          </div>
        </div>
        {phase.objective && (
          <CardDescription className="flex items-center gap-2">
            <Target className="h-4 w-4" /> {phase.objective}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Accordion type="multiple">
          {phase.sections.map(section => (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{section.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {section.tasks.filter(t => t.completed).length}/{section.tasks.length} tasks
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {section.tasks.map(task => (
                    <ErrorBoundary key={task.id} fallback={<div>Error rendering task</div>}>
                      <TaskItem task={task} onToggleTask={onToggleTask} />
                    </ErrorBoundary>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
