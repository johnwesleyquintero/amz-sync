// src/components/dashboard/TodoDataGrid.tsx
import React, { useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { type Task, type SubTask } from '@/types/todo';

interface TodoDataGridProps {
  tasks: (Task | SubTask)[];
  onToggleTask: (taskId: string, completed: boolean) => void;
}

const TodoDataGrid: React.FC<TodoDataGridProps> = ({ tasks, onToggleTask }) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');

  const columns = useMemo<ColumnDef<Task | SubTask>[]>(
    () => [
      {
        id: 'completed',
        header: 'Status',
        cell: ({ row }) => (
          <Checkbox
            checked={row.original.completed}
            onCheckedChange={checked => onToggleTask(row.original.id, !!checked)}
          />
        ),
        enableSorting: true,
      },
      {
        accessorKey: 'text',
        header: 'Task',
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <span className={row.original.completed ? 'line-through text-muted-foreground' : ''}>
              {row.original.text}
            </span>
            {row.original.description && (
              <span className="text-sm text-muted-foreground">{row.original.description}</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => {
          const priority = row.original.priority;
          if (!priority) return null;
          return (
            <Badge
              variant={
                priority === 'high'
                  ? 'destructive'
                  : priority === 'medium'
                    ? 'default'
                    : 'secondary'
              }
            >
              {priority}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'owner',
        header: 'Owner',
        cell: ({ row }) => row.original.owner || '-',
      },
      {
        accessorKey: 'dueDate',
        header: 'Due Date',
        cell: ({ row }) => {
          const date = row.original.dueDate;
          if (!date) return '-';
          return new Date(date).toLocaleDateString();
        },
      },
      {
        id: 'progress',
        header: 'Progress',
        cell: ({ row }) => {
          const subtasks = row.original.subTasks || [];
          if (subtasks.length === 0) return null;
          const completed = subtasks.filter(t => t.completed).length;
          const percentage = Math.round((completed / subtasks.length) * 100);
          return (
            <div className="flex items-center gap-2">
              <Progress value={percentage} className="w-24" />
              <span className="text-sm text-muted-foreground">
                {completed}/{subtasks.length}
              </span>
            </div>
          );
        },
      },
    ],
    [onToggleTask]
  );

  const table = useReactTable({
    data: tasks,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search tasks..."
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="border-b px-4 py-2 text-left font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center gap-2 ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <ChevronUp className="h-4 w-4" />,
                          desc: <ChevronDown className="h-4 w-4" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-b last:border-b-0">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TodoDataGrid;
