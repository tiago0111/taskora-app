'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import type { Project } from '@/types';
import { fetchWithAuth } from '@/utils/api';

// --- Componente da Página Principal ---
export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');

  // Função para buscar projetos da API usando o utilitário
  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchWithAuth('/projects');

      if (!response.ok) {
        // A lógica de redirecionamento já está no fetchWithAuth
        throw new Error('Não foi possível carregar os projetos. Verifique se a sua API está a correr.');
      }

      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.error("ERRO na função fetchProjects:", err);
      if (err instanceof Error) setError(err.message);
      else setError("Ocorreu um erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Busca os projetos quando o componente é montado
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    const normalizedStatus = project.status.toLowerCase().replace(' ', '');
    return normalizedStatus === filter.toLowerCase().replace(' ', '');
  });

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return 'N/D';
    const diff = new Date(endDate).getTime() - new Date().getTime();
    if (diff < 0) return 'Atrasado';
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-8">
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
      
      <div>
        {isLoading ? (
          <p className="text-center text-slate-400 py-10">A carregar projetos...</p>
        ) : error ? (
          <p className="text-center text-red-400 py-10">{error}</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div key={project.id} className={`bg-slate-800 rounded-2xl border-l-4 ${project.color || 'border-indigo-500'} border-y border-r border-slate-700 shadow-lg p-6 space-y-4`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white">{project.name}</h3>
                      <p className="text-slate-400 text-sm mt-1">{project.description || 'Sem descrição.'}</p>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm font-medium text-slate-300">
                      <span>Progresso</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                      <div className={`${(project.color || 'border-indigo-500').replace('border-', 'bg-')} h-2.5 rounded-full`} style={{ width: `${project.progress}%` }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-400 border-t border-slate-700 pt-4">
                    <div/>
                    <div className="flex items-center gap-2">
                      <i className="bx bx-calendar-check text-lg"></i>
                      <span>{getDaysRemaining(project.endDate)} dias restantes</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 lg:col-span-2 py-10">
                <p>Ainda não tem projetos. Clique em novo projeto para começar.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && <NewProjectModal onClose={() => setShowModal(false)} onProjectCreated={fetchProjects} />}
    </div>
  );
}

// --- Componente para a Etiqueta de Status ---
function StatusBadge({ status }: { status: string }) {
    const statusMap: { [key: string]: string } = {
        'Em progresso': 'bg-blue-500/20 text-blue-300',
        'Planeamento': 'bg-yellow-500/20 text-yellow-300',
        'Concluído': 'bg-green-500/20 text-green-300',
        'Em pausa': 'bg-slate-600 text-slate-300'
    };
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusMap[status] || 'bg-gray-500/20 text-gray-300'}`}>{status}</span>;
}

// --- Componente para o Modal, AGORA COM LÓGICA ---
interface NewProjectModalProps {
  onClose: () => void;
  onProjectCreated: () => void; // A nova prop para "avisar" a página principal
}

function NewProjectModal({ onClose, onProjectCreated }: NewProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
        setError('O nome do projeto é obrigatório.');
        return;
    }
    setIsLoading(true);
    setError(null);

    try {
        const response = await fetchWithAuth('/projects', {
            method: 'POST',
            body: JSON.stringify({ name, description })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao criar o projeto.');
        }

        onProjectCreated();
        onClose();

    } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError('Ocorreu um erro inesperado.');
    } finally {
        setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Criar Novo Projeto</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><i className="bx bx-x text-2xl"></i></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input 
            type="text" 
            placeholder="Nome do Projeto" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-12 px-4 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            disabled={isLoading}
          />
          <textarea 
            placeholder="Descrição do Projeto (opcional)" 
            rows={3} 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-4 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            disabled={isLoading}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-3 text-slate-300 hover:bg-slate-700 rounded-xl font-semibold transition-colors">Cancelar</button>
            <button type="submit" className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50" disabled={isLoading}>
              {isLoading ? 'A criar...' : 'Criar Projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}