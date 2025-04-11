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

interface PhaseComponentProps {
  phase: Phase;
}

import { Phase } from '@/types/todo';

export function PhaseComponent({ phase, onComplete, onToggleTask }: PhaseComponentProps) {
  const calculateProgress = (tasks: Task[]) => {
    const total = tasks.flatMap(t => t.subTasks || []).length + tasks.length;
    const completed =
      tasks.filter(t => t.completed).length +
      tasks.flatMap(t => t.subTasks?.filter((st: { completed: boolean }) => st.completed) || [])
        .length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <Card className={cn(phase.completed ? 'opacity-70' : '', 'group relative overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary/5')}>
      {/* Premium gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-accent/[0.03] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <CardHeader className="relative space-y-1">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
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
            <AccordionItem key={section.id} value={section.id} className="border-none [&[data-state=open]]:bg-muted/40">
              <AccordionTrigger className="rounded-lg px-4 py-2 hover:bg-muted/60 hover:no-underline [&[data-state=open]]:rounded-b-none">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{section.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {section.tasks.filter(t => t.completed).length}/{section.tasks.length} tasks
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 rounded-b-lg bg-muted/40 px-4 pb-4 pt-2">
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
}
