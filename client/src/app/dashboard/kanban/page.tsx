'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

// --- Interfaces TypeScript para os nossos dados ---
interface Task {
  id: number;
  title: string;
  assignee: string;
  priority: 'Alta' | 'Média' | 'Baixa';
}

interface Column {
  id: 'todo' | 'progress' | 'review' | 'done';
  title: string;
  color: string;
}

// --- Componente da Página ---
export default function KanbanPage() {
  // AQUI ESTÁ A CORREÇÃO: Adicionamos o tipo explícito ao useState
  const [tasks, setTasks] = useState<Record<Column['id'], Task[]>>({
    todo: [
      { id: 1, title: 'Implementar autenticação OAuth', assignee: 'João Silva', priority: 'Alta' },
      { id: 2, title: 'Design do dashboard principal', assignee: 'Maria Santos', priority: 'Média' },
      { id: 3, title: 'Configurar pipeline de CI/CD', assignee: 'Pedro Costa', priority: 'Baixa' }
    ],
    progress: [
      { id: 4, title: 'Desenvolver API de notificações', assignee: 'Ana Oliveira', priority: 'Alta' },
      { id: 5, title: 'Escrever testes unitários para a API', assignee: 'Carlos Lima', priority: 'Média' }
    ],
    review: [
      { id: 6, title: 'Rever documentação da API', assignee: 'Sofia Rodrigues', priority: 'Baixa' }
    ],
    done: [
      { id: 7, title: 'Setup inicial do projeto Next.js', assignee: 'João Silva', priority: 'Alta' },
      { id: 8, title: 'Configuração da base de dados com Prisma', assignee: 'Maria Santos', priority: 'Média' }
    ]
  });

  const columns: Column[] = [
    { id: 'todo', title: 'Para Fazer', color: 'border-blue-500' },
    { id: 'progress', title: 'Em Progresso', color: 'border-yellow-500' },
    { id: 'review', title: 'Em Revisão', color: 'border-purple-500' },
    { id: 'done', title: 'Concluído', color: 'border-green-500' }
  ];

  return (
    <div className="space-y-8">
      {/* === Header da Página === */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Kanban Board</h1>
          <p className="text-slate-400 mt-1">Visualize e gira o fluxo de trabalho da sua equipa.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="h-12 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 font-semibold rounded-xl transition-colors flex items-center">
            <i className="bx bx-filter mr-2 text-xl"></i>
            Filtros
          </button>
          <button className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white px-5 font-semibold rounded-xl transition-colors flex items-center shadow-lg">
            <i className="bx bx-plus mr-2 text-xl"></i>
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* === Kanban Board === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {columns.map((column) => (
          <KanbanColumn 
            key={column.id} 
            column={column} 
            tasks={tasks[column.id] || []} 
          />
        ))}
      </div>
    </div>
  );
}

// --- Componente para a Coluna do Kanban ---
function KanbanColumn({ column, tasks }: { column: Column, tasks: Task[] }) {
  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 flex flex-col">
      {/* Header da Coluna */}
      <div className={`p-4 border-b-4 ${column.color}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white">{column.title}</h3>
          <span className="bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full text-xs font-medium">
            {tasks.length}
          </span>
        </div>
      </div>
      
      {/* Cartões de Tarefa */}
      <div className="p-4 space-y-4 min-h-[200px]">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
        <button className="w-full border-2 border-dashed border-slate-600 rounded-lg p-3 text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-2">
          <i className="bx bx-plus"></i>
          Adicionar Tarefa
        </button>
      </div>
    </div>
  );
}

// --- Componente para o Cartão de Tarefa ---
function KanbanCard({ task }: { task: Task }) {
  const getPriorityClasses = (priority: Task['priority']) => {
    switch (priority) {
      case 'Alta': return 'bg-red-500/20 text-red-300';
      case 'Média': return 'bg-orange-500/20 text-orange-300';
      case 'Baixa': return 'bg-blue-500/20 text-blue-300';
    }
  };
  
  return (
    <div className="bg-slate-700/50 rounded-lg p-4 shadow-sm hover:shadow-lg hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer">
      <h4 className="font-semibold text-white mb-3 text-md">{task.title}</h4>
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClasses(task.priority)}`}>
          {task.priority}
        </span>
        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-slate-500">
          {task.assignee.split(' ').map(n => n[0]).join('')}
        </div>
      </div>
    </div>
  );
}