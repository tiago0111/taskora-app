'use client';

import { useState , useEffect} from 'react';
import { useRouter } from 'next/navigation';
import type { Project, Task } from '@/types'; 





export default function TasksPage() {
  const [filter, setFilter] = useState<'all' | 'PENDENTE' | 'EM_PROGRESSO' | 'CONCLUIDA'>('all');
  

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Ir buscar a lista de projetos UMA VEZ quando a página carrega
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/');
          return;
        }

        const response = await fetch('http://localhost:3001/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Falha ao carregar os seus projetos.');

        const projectsData: Project[] = await response.json();
        setProjects(projectsData);

        
        if (projectsData.length > 0) {
          setSelectedProjectId(projectsData[0].id);
        }
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setIsLoadingProjects(false);
      }
    };
    fetchProjects();
  }, [router]);

  // Ir buscar as tarefas SEMPRE QUE o projeto selecionado mudar
  useEffect(() => {
    // Só executa se houver um projeto selecionado
    if (!selectedProjectId) return;

    const fetchTasksForProject = async () => {
      setIsLoadingTasks(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/');
          return;
        }

        const response = await fetch(`http://localhost:3001/api/projects/${selectedProjectId}/tasks`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Falha ao carregar as tarefas deste projeto.');

        const tasksData: Task[] = await response.json();
        setTasks(tasksData);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setIsLoadingTasks(false);
      }
    };
    fetchTasksForProject();
  }, [selectedProjectId, router]); // Depende do projeto selecionado

  // ... (funções de filtragem e cores permanecem iguais)
  const filteredTasks = filter === 'all' ? tasks : tasks.filter(task => {
    const statusMap: { [key: string]: string } = {
      pending: 'PENDENTE',
      progress: 'EM_PROGRESSO',
      completed: 'CONCLUIDA'
    };
    return task.status === statusMap[filter];
  });
  const getStatusColor = (status: string) => {
    const map: Record<string, string> = { 'CONCLUIDA': 'bg-green-500/20 text-green-300', 'EM_PROGRESSO': 'bg-yellow-500/20 text-yellow-300', 'PENDENTE': 'bg-slate-600 text-slate-300' };
    return map[status] || 'bg-gray-500/20 text-gray-300';
  };
  const getPriorityColor = (priority: string) => {
    const map: Record<string, string> = { 'ALTA': 'bg-red-500/20 text-red-300', 'MEDIA': 'bg-orange-500/20 text-orange-300', 'BAIXA': 'bg-blue-500/20 text-blue-300' };
    return map[priority] || 'bg-gray-500/20 text-gray-300';
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
          <FilterButton label="Pendentes" count={tasks.filter(t => t.status === 'Pendente').length} active={filter === 'PENDENTE'} onClick={() => setFilter('PENDENTE')} />
          <FilterButton label="Em Progresso" count={tasks.filter(t => t.status === 'Em progresso').length} active={filter === 'EM_PROGRESSO'} onClick={() => setFilter('EM_PROGRESSO')} />
          <FilterButton label="Concluídas" count={tasks.filter(t => t.status === 'Concluída').length} active={filter === 'CONCLUIDA'} onClick={() => setFilter('CONCLUIDA')} />
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
                    <span className="flex items-center gap-1"><i className='bx bx-user-circle'></i>{task.assignee.name}</span>
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