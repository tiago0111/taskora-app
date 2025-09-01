import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { Task } from '@/types';

export function KanbanCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: task.id,
    data: {
      type: 'Task',
      task,
    }
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityClasses = (priority: Task['priority']) => {
    switch (priority) {
      case 'ALTA': return 'bg-red-500/20 text-red-300';
      case 'MEDIA': return 'bg-orange-500/20 text-orange-300';
      case 'BAIXA': return 'bg-blue-500/20 text-blue-300';
      default: return 'bg-slate-500/20 text-slate-300';
    }
  };
  
  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-slate-700/50 rounded-lg p-4 shadow-sm hover:shadow-lg hover:ring-2 hover:ring-indigo-500 transition-all cursor-grab touch-none"
    >
      <h4 className="font-semibold text-white mb-3 text-md">{task.title}</h4>
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClasses(task.priority)}`}>
          {task.priority}
        </span>
        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-slate-500">
          {task.assignee?.name.split(' ').map(n => n[0]).join('') || 'N/A'}
        </div>
      </div>
    </div>
  );
}