'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { DndContext, useSensor, useSensors, PointerSensor, KeyboardSensor, closestCorners, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task, Project, TaskStatus } from '@/types';
import { fetchWithAuth } from '@/utils/api';

// --- Interfaces e Tipos ---
interface Column {
  id: TaskStatus;
  title: string;
  color: string;
}

// --- Componente da Página Principal ---
export default function KanbanPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasksForProject = useCallback(async (projectId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const tasksResponse = await fetchWithAuth(`/projects/${projectId}/tasks`);
      if (!tasksResponse.ok) throw new Error('Falha ao carregar as tarefas.');
      const tasksData: Task[] = await tasksResponse.json();
      setTasks(tasksData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar tarefas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const projectsResponse = await fetchWithAuth('/projects');
      if (!projectsResponse.ok) throw new Error('Falha ao carregar projetos.');
      const projectsData: Project[] = await projectsResponse.json();
      setProjects(projectsData);

      if (projectsData.length > 0) {
        const firstProjectId = projectsData[0].id;
        setSelectedProjectId(firstProjectId);
        await fetchTasksForProject(firstProjectId);
      } else {
        setError("Nenhum projeto encontrado. Crie um projeto para começar.");
        setTasks([]);
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setIsLoading(false);
    }
  }, [fetchTasksForProject]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProjectChange = async (projectId: number) => {
    setSelectedProjectId(projectId);
    await fetchTasksForProject(projectId);
  };
  
  const columns: Column[] = [
    { id: 'PENDENTE', title: 'Para Fazer', color: 'border-blue-500' },
    { id: 'EM_PROGRESSO', title: 'Em Progresso', color: 'border-yellow-500' },
    { id: 'EM_REVISAO', title: 'Em Revisão', color: 'border-purple-500' },
    { id: 'CONCLUIDA', title: 'Concluído', color: 'border-green-500' }
  ];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as number;
    const overId = over.id as number | TaskStatus;
    if (activeId === overId) return;

    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;
    
    // ======================= INÍCIO DA CORREÇÃO =======================
    // Determina a coluna de destino (o novo status) de forma segura
    let newStatus: TaskStatus;
    const overIsColumn = columns.some(c => c.id === overId);

    if (overIsColumn) {
        newStatus = overId as TaskStatus;
    } else {
        const overTask = tasks.find(t => t.id === overId);
        if (!overTask) return;
        newStatus = overTask.status;
    }
    // ======================= FIM DA CORREÇÃO =======================

    // Se a tarefa foi movida para uma nova coluna
    if (activeTask.status !== newStatus) {
      setTasks(currentTasks => 
        currentTasks.map(task => 
          task.id === activeId ? { ...task, status: newStatus } : task
        )
      );
      updateTaskStatusInApi(activeId, newStatus, activeTask.status);
    } 
    // Se foi reordenada na mesma coluna
    else {
        const oldIndex = tasks.findIndex(t => t.id === activeId);
        const newIndex = tasks.findIndex(t => t.id === overId);
        if (oldIndex !== newIndex) {
            setTasks(currentTasks => arrayMove(currentTasks, oldIndex, newIndex));
            toast.success('Ordem das tarefas atualizada!');
        }
    }
  };

  const updateTaskStatusInApi = async (taskId: number, newStatus: TaskStatus, originalStatus: TaskStatus) => {
    const promise = fetchWithAuth(`/projects/${selectedProjectId}/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
    });

    toast.promise(
      promise.then(response => {
        if (!response.ok) {
          return response.json().then(err => Promise.reject(err));
        }
        return response.json();
      }),
      {
        loading: 'A guardar alteração...',
        success: 'Tarefa movida com sucesso!',
        error: (err: unknown) => {
          setTasks(currentTasks => 
              currentTasks.map(t => 
                  t.id === taskId ? { ...t, status: originalStatus } : t
              )
          );
          if (err && typeof err === 'object' && 'message' in err) {
            return `Erro: ${String(err.message)}`;
          }
          return 'Não foi possível mover a tarefa.';
        }
      }
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Kanban Board</h1>
          <p className="text-slate-400 mt-1">Visualize e gira o fluxo de trabalho.</p>
        </div>
        <select value={selectedProjectId || ''} onChange={(e) => handleProjectChange(Number(e.target.value))} className="h-12 border border-slate-700 rounded-xl px-4 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {isLoading ? (
        <p className="text-center text-slate-400 py-10">A carregar o Kanban...</p>
      ) : error ? (
        <p className="text-center text-red-400 py-10">{error}</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {columns.map((column) => (
              <KanbanColumn 
                key={column.id} 
                column={column} 
                tasks={tasks.filter(t => t.status === column.id)} 
              />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}

function KanbanColumn({ column, tasks }: { column: Column, tasks: Task[] }) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { type: 'Column' }
  });

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 flex flex-col">
      <div className={`p-4 border-b-4 ${column.color}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white">{column.title}</h3>
          <span className="bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full text-xs font-medium">{tasks.length}</span>
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

function KanbanCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: task.id,
    data: { type: 'Task', task }
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