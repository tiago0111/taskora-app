'use client';

import { useState } from 'react';

// --- Interfaces TypeScript para os nossos dados ---
interface Project {
  id: number;
  name: string;
  description: string;
  status: 'Em progresso' | 'Planeamento' | 'Concluído' | 'Em pausa';
  progress: number;
  startDate: string;
  endDate: string;
  team: string[];
  tasks: { total: number; completed: number };
  color: string;
  priority: 'Alta' | 'Média' | 'Baixa';
}

// --- Componente da Página ---
export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([
    { id: 1, name: 'Taskora - Sistema de Gestão', description: 'Plataforma completa de gestão de tarefas e produtividade.', status: 'Em progresso', progress: 75, startDate: '2024-01-01', endDate: '2025-02-15', team: ['Tiago', 'Maria'], tasks: { total: 24, completed: 18 }, color: 'border-blue-500', priority: 'Alta' },
    { id: 2, name: 'Website Corporativo', description: 'Redesign completo do website da empresa com foco em conversão.', status: 'Planeamento', progress: 25, startDate: '2025-02-01', endDate: '2025-03-30', team: ['Ana', 'Pedro'], tasks: { total: 16, completed: 4 }, color: 'border-green-500', priority: 'Média' },
    { id: 3, name: 'App Mobile', description: 'Aplicação móvel para acompanhamento de tarefas em tempo real.', status: 'Concluído', progress: 100, startDate: '2023-11-01', endDate: '2024-12-31', team: ['Carlos', 'Sofia'], tasks: { total: 32, completed: 32 }, color: 'border-purple-500', priority: 'Alta' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    const normalizedStatus = project.status.toLowerCase().replace(' ', '');
    return normalizedStatus === filter;
  });

  const getDaysRemaining = (endDate: string) => {
    const diff = new Date(endDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-8">
      {/* === Header da Página === */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestão de Projetos</h1>
          <p className="text-slate-400 mt-1">Organize e acompanhe o progresso dos seus projetos.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white px-5 font-semibold rounded-xl transition-colors flex items-center shadow-lg"
        >
          <i className="bx bx-plus mr-2 text-xl"></i>
          Novo Projeto
        </button>
      </div>

      {/* === Barra de Filtros === */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'Em progresso', 'Planeamento', 'Concluído', 'Em pausa'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status === 'all' ? 'all' : status.toLowerCase().replace(' ', ''))}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === (status === 'all' ? 'all' : status.toLowerCase().replace(' ', ''))
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              {status === 'all' ? 'Todos' : status}
            </button>
          ))}
        </div>
        <span className="text-sm text-slate-400 hidden md:block">{filteredProjects.length} projetos</span>
      </div>

      {/* === Grelha de Projetos === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className={`bg-slate-800 rounded-2xl border-l-4 ${project.color} border-y border-r border-slate-700 shadow-lg p-6 space-y-4`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white">{project.name}</h3>
                <p className="text-slate-400 text-sm mt-1">{project.description}</p>
              </div>
              <StatusBadge status={project.status} />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-sm font-medium text-slate-300">
                <span>Progresso</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div className={`${project.color.replace('border-', 'bg-')} h-2.5 rounded-full`} style={{ width: `${project.progress}%` }}></div>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm text-slate-400 border-t border-slate-700 pt-4">
              <div className="flex -space-x-2">
                {project.team.map(member => (
                  <div key={member} title={member} className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-slate-800">
                    {member.split(' ').map(n => n[0]).join('')}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <i className="bx bx-calendar-check text-lg"></i>
                <span>{getDaysRemaining(project.endDate)} dias restantes</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* === Modal de Novo Projeto === */}
      {showModal && <NewProjectModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

// --- Componente para a Etiqueta de Status ---
function StatusBadge({ status }: { status: Project['status'] }) {
  const colors = {
    'Em progresso': 'bg-blue-500/20 text-blue-300',
    'Planeamento': 'bg-yellow-500/20 text-yellow-300',
    'Concluído': 'bg-green-500/20 text-green-300',
    'Em pausa': 'bg-slate-600 text-slate-300'
  };
  return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>{status}</span>;
}

// --- Componente para o Modal (para manter o código principal limpo) ---
function NewProjectModal({ onClose }: { onClose: () => void }) {
  // A lógica do formulário (useState, handleCreate) iria aqui
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Criar Novo Projeto</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white"><i className="bx bx-x text-2xl"></i></button>
          </div>
        </div>
        <form className="p-6 space-y-4">
          <input type="text" placeholder="Nome do Projeto" className="w-full h-12 px-4 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <textarea placeholder="Descrição do Projeto" rows={3} className="w-full p-4 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          {/* ... outros campos como datas, prioridade, etc. ... */}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-3 text-slate-300 hover:bg-slate-700 rounded-xl font-semibold transition-colors">Cancelar</button>
            <button type="submit" className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors">Criar Projeto</button>
          </div>
        </form>
      </div>
    </div>
  );
}