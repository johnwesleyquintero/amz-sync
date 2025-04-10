import { ColumnDef } from '@tanstack/react-table';
import type { Phase, Task } from '@/types/todo';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

export const columns: ColumnDef<Phase>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Phase',
    cell: ({ row }) => {
      const phase = row.original;
      return (
        <div className="font-medium">
          {phase.name}
          <div className="text-sm text-muted-foreground">{phase.objective}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'progress',
    header: 'Completion',
    cell: ({ row }) => {
      const progress = row.original.sections
        .flatMap(s => s.tasks)
        .reduce((acc, task) => (task.completed ? acc + 1 : acc), 0);

      const totalTasks = row.original.sections.flatMap(s => s.tasks).length;

      return (
        <div className="flex items-center gap-2">
          <Progress value={(progress / totalTasks) * 100} className="w-[200px]" />
          <span className="text-muted-foreground">
            {progress} / {totalTasks}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => {
      const priority = row.original.priority.toLowerCase();
      return (
        <Badge
          variant={priority === 'highest priority' ? 'destructive' : 'secondary'}
          className="capitalize"
        >
          {priority}
        </Badge>
      );
    },
  },
];
