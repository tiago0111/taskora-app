import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
// CORREÇÃO: useDroppable vem do @dnd-kit/core
import { useDroppable } from '@dnd-kit/core';
import { Column } from './page';
// CORREÇÃO: Importa o tipo Task global
import type { Task } from '@/types';
import { KanbanCard } from './kanbanCard';

export function KanbanColumn({ column, tasks }: { column: Column, tasks: Task[] }) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
    }
  });

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 flex flex-col">
      <div className={`p-4 border-b-4 ${column.color}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white">{column.title}</h3>
          <span className="bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full text-xs font-medium">
            {tasks.length}
          </span>
        </div>
      </div>
      
      <div ref={setNodeRef} className="p-4 space-y-4 min-h-[200px]">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}