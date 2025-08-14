'use client';

import { useState } from 'react';

// --- Interfaces TypeScript para os nossos dados ---
interface Task {
  id: number;
  title: string;
  description: string;
  status: 'Concluída' | 'Em progresso' | 'Pendente';
  priority: 'Alta' | 'Média' | 'Baixa';
  assignee: string;
  dueDate: string;
  progress: number;
  category: string;
}

// --- Componente da Página ---
export default function TasksPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'progress' | 'completed'>('all');
  
  // Dados de exemplo (Mock data)
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Implementar dashboard analytics', description: 'Criar gráficos e métricas para o dashboard principal', status: 'Em progresso', priority: 'Alta', assignee: 'João Silva', dueDate: '2024-01-15', progress: 75, category: 'Desenvolvimento' },
    { id: 2, title: 'Configurar Firebase Authentication', description: 'Implementar sistema de autenticação com Firebase', status: 'Concluída', priority: 'Média', assignee: 'Maria Santos', dueDate: '2024-01-12', progress: 100, category: 'Desenvolvimento' },
    { id: 3, title: 'Design da nova sidebar', description: 'Criar novo design para a barra lateral do dashboard', status: 'Concluída', priority: 'Baixa', assignee: 'Pedro Costa', dueDate: '2024-01-10', progress: 100, category: 'Design' },
    { id: 4, title: 'Implementar testes unitários', description: 'Criar testes para os componentes principais', status: 'Pendente', priority: 'Alta', assignee: 'Ana Oliveira', dueDate: '2024-01-18', progress: 0, category: 'Qualidade' }
  ]);

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(task => {
    if (filter === 'pending') return task.status === 'Pendente';
    if (filter === 'progress') return task.status === 'Em progresso';
    if (filter === 'completed') return task.status === 'Concluída';
    return true;
  });

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'Concluída': return 'bg-green-500/20 text-green-300';
      case 'Em progresso': return 'bg-yellow-500/20 text-yellow-300';
      case 'Pendente': return 'bg-slate-600 text-slate-300';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'Alta': return 'bg-red-500/20 text-red-300';
      case 'Média': return 'bg-orange-500/20 text-orange-300';
      case 'Baixa': return 'bg-blue-500/20 text-blue-300';
    }
  };

  return (
    <div className="space-y-8">
      {/* === Header da Página === */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestão de Tarefas</h1>
          <p className="text-slate-400 mt-1">Organize, acompanhe e complete as suas tarefas.</p>
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

      {/* === Barra de Filtros e Pesquisa === */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <FilterButton label="Todas" count={tasks.length} active={filter === 'all'} onClick={() => setFilter('all')} />
          <FilterButton label="Pendentes" count={tasks.filter(t => t.status === 'Pendente').length} active={filter === 'pending'} onClick={() => setFilter('pending')} />
          <FilterButton label="Em Progresso" count={tasks.filter(t => t.status === 'Em progresso').length} active={filter === 'progress'} onClick={() => setFilter('progress')} />
          <FilterButton label="Concluídas" count={tasks.filter(t => t.status === 'Concluída').length} active={filter === 'completed'} onClick={() => setFilter('completed')} />
        </div>
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <i className="bx bx-search text-slate-500"></i>
          </div>
          <input
            type="text"
            className="w-full h-10 pl-10 pr-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Pesquisar tarefas..."
          />
        </div>
      </div>

      {/* === Lista de Tarefas === */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-indigo-500 transition-all duration-300">
            <div className="flex items-start space-x-4">
              <input 
                type="checkbox" 
                className="w-5 h-5 mt-1 text-indigo-500 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500 focus:ring-2"
                defaultChecked={task.status === 'Concluída'}
              />
              <div className="flex-1">
                <h3 className={`text-lg font-bold mb-1 ${task.status === 'Concluída' ? 'text-slate-500 line-through' : 'text-white'}`}>
                  {task.title}
                </h3>
                <p className="text-slate-400 text-sm mb-4">{task.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-slate-400">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>{task.status}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                    <span className="flex items-center gap-1"><i className='bx bx-calendar'></i>{task.dueDate}</span>
                    <span className="flex items-center gap-1"><i className='bx bx-user-circle'></i>{task.assignee}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"><i className="bx bx-edit text-xl"></i></button>
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"><i className="bx bx-trash text-xl"></i></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Componente reutilizável para os botões de filtro ---
function FilterButton({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void; }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-indigo-600 text-white'
          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
      }`}
    >
      {label}
      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
        active ? 'bg-indigo-400 text-white' : 'bg-slate-600 text-slate-200'
      }`}>
        {count}
      </span>
    </button>
  );
}