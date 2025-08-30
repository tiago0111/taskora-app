'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Project, Task } from '@/types'; 
import { type } from 'os';

// --- Interfaces para os novos componentes (se ainda não existirem) ---
interface ModalProps {
    onClose: () => void;
    // Accept the fields that TaskModal actually submits
    onSave: (taskData: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority'>>) => Promise<void> | void;
    projects: Project[];
    task?: Task | null;
    selectedProjectId: number | null;
}

// --- Componente da Página ---
export default function TasksPage() {
    const [filter, setFilter] = useState<'all' | 'PENDENTE' | 'EM_PROGRESSO' | 'CONCLUIDA'>('all');
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

    const router = useRouter();

    const fetchProjects = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error('Token de autenticação não encontrado. Redirecionando para login.');
                router.push('/');
                return;
            }

            const response = await fetch('http://localhost:3001/api/projects', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erro ao carregar projetos:', response.status, errorText);
                throw new Error('Falha ao carregar os seus projetos.');
            }

            const projectsData: Project[] = await response.json();
            setProjects(projectsData);
            console.log('Projetos carregados:', projectsData);

            if (projectsData.length > 0 && typeof projectsData[0].id === 'number' && projectsData[0].id > 0) {
                setSelectedProjectId(projectsData[0].id);
            } else {
                setSelectedProjectId(null);
                setError('Nenhum projeto disponível. Crie um projeto para começar.');
            }
        } catch (err) {
            if (err instanceof Error) setError(err.message);
        } finally {
            setIsLoadingProjects(false);
        }
    }, [router]);

    const fetchTasksForProject = useCallback(async () => {
        if (!selectedProjectId || typeof selectedProjectId !== 'number' || selectedProjectId <= 0) {
            setError('Nenhum projeto selecionado ou ID inválido.');
            setTasks([]);
            return;
        }

        setIsLoadingTasks(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error('Token de autenticação não encontrado. Redirecionando para login.');
                router.push('/');
                return;
            }

            const response = await fetch(`http://localhost:3001/api/projects/${selectedProjectId}/tasks`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erro ao carregar tarefas:', response.status, errorText);
                throw new Error(`Falha ao carregar as tarefas deste projeto. (${response.status})`);
            }

            const tasksData: Task[] = await response.json();
            setTasks(tasksData);
        } catch (err) {
            if (err instanceof Error) setError(err.message);
        } finally {
            setIsLoadingTasks(false);
        }
    }, [selectedProjectId, router]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    useEffect(() => {
        fetchTasksForProject();
    }, [fetchTasksForProject]);

    // Accept the same shape the modal submits
    const handleCreateTask = async (
        taskData: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority'>>
    ) => {
        if (!selectedProjectId) return;
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/');
            return;
        }
        try {
            const response = await fetch(`http://localhost:3001/api/projects/${selectedProjectId}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    title: taskData.title,
                    description: taskData.description ?? '',
                    status: taskData.status ?? 'PENDENTE',
                    priority: taskData.priority ?? 'MEDIA',
                })
            });
            if (!response.ok) throw new Error('Falha ao criar a tarefa.');
            fetchTasksForProject();
        } catch (err) {
            if (err instanceof Error) setError(err.message);
        }
    };

    const handleUpdateTask = async (
        taskId: number,
        taskData: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority'>>
    ) => {
        if (!selectedProjectId) return;
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/');
            return;
        }
        try {
            const response = await fetch(`http://localhost:3001/api/projects/${selectedProjectId}/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(taskData)
            });
            if (!response.ok) throw new Error('Falha ao atualizar a tarefa.');
            fetchTasksForProject();
        } catch (err) {
            if (err instanceof Error) setError(err.message);
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        if (!selectedProjectId || !window.confirm('Tem a certeza que quer apagar esta tarefa?')) return;
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/');
            return;
        }
        try {
            const response = await fetch(`http://localhost:3001/api/projects/${selectedProjectId}/tasks/${taskId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Falha ao apagar a tarefa.');
            fetchTasksForProject();
        } catch (err) {
            if (err instanceof Error) setError(err.message);
        }
    };

    const filteredTasks = filter === 'all' ? tasks : tasks.filter(task => task.status === filter);
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
                    <button 
                        onClick={() => { if (selectedProjectId && typeof selectedProjectId === 'number' && selectedProjectId > 0) { setTaskToEdit(null); setShowModal(true); } }}
                        className={`h-12 bg-indigo-600 hover:bg-indigo-700 text-white px-5 font-semibold rounded-xl transition-colors flex items-center shadow-lg ${(!selectedProjectId || typeof selectedProjectId !== 'number' || selectedProjectId <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!selectedProjectId || typeof selectedProjectId !== 'number' || selectedProjectId <= 0}
                    >
                        <i className="bx bx-plus mr-2 text-xl"></i>
                        Nova Tarefa
                    </button>
                </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                    <FilterButton label="Todas" count={tasks.length} active={filter === 'all'} onClick={() => setFilter('all')} />
                    <FilterButton label="Pendentes" count={tasks.filter(t => t.status === 'PENDENTE').length} active={filter === 'PENDENTE'} onClick={() => setFilter('PENDENTE')} />
                    <FilterButton label="Em Progresso" count={tasks.filter(t => t.status === 'EM_PROGRESSO').length} active={filter === 'EM_PROGRESSO'} onClick={() => setFilter('EM_PROGRESSO')} />
                    <FilterButton label="Concluídas" count={tasks.filter(t => t.status === 'CONCLUIDA').length} active={filter === 'CONCLUIDA'} onClick={() => setFilter('CONCLUIDA')} />
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
                {isLoadingTasks ? (
                    <p className="text-center text-slate-400 py-10">A carregar tarefas...</p>
                ) : error ? (
                    <p className="text-center text-red-400 py-10">{error}</p>
                ) : filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                        <div key={task.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-indigo-500 transition-all duration-300">
                            <div className="flex items-start space-x-4">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 mt-1 text-indigo-500 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500 focus:ring-2"
                                    checked={task.status === 'CONCLUIDA'}
                                    onChange={() => handleUpdateTask(task.id, { status: task.status === 'CONCLUIDA' ? 'PENDENTE' : 'CONCLUIDA' })}
                                />
                                <div className="flex-1">
                                    <h3 className={`text-lg font-bold mb-1 ${task.status === 'CONCLUIDA' ? 'text-slate-500 line-through' : 'text-white'}`}>
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
                                            <button 
                                                onClick={() => { setTaskToEdit(task); setShowModal(true); }}
                                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                <i className="bx bx-edit text-xl"></i>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                <i className="bx bx-trash text-xl"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-slate-500 py-10">
                        <p>Não há tarefas para este projeto.</p>
                    </div>
                )}
            </div>
            
            {showModal && selectedProjectId && typeof selectedProjectId === 'number' && selectedProjectId > 0 && (
                <TaskModal 
                    onClose={() => setShowModal(false)}
                    onSave={taskToEdit ? (data) => handleUpdateTask(taskToEdit.id, data) : handleCreateTask}
                    projects={projects}
                    task={taskToEdit}
                    selectedProjectId={selectedProjectId}
                />
            )}
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

// --- Componente para o Modal de Tarefas ---
function TaskModal({ onClose, onSave, projects, task, selectedProjectId }: ModalProps) {
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [status, setStatus] = useState(task?.status || 'PENDENTE');
    const [priority, setPriority] = useState(task?.priority || 'MEDIA');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!title.trim()) {
            setError('O título da tarefa é obrigatório.');
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            await onSave({ title, description, status, priority });
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
                    <h2 className="text-xl font-bold text-white">{task ? 'Editar Tarefa' : 'Criar Nova Tarefa'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><i className="bx bx-x text-2xl"></i></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <input 
                        type="text" 
                        placeholder="Título da Tarefa" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="input-field" 
                        disabled={isLoading}
                    />
                    <textarea 
                        placeholder="Descrição da Tarefa (opcional)" 
                        rows={3} 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="input-field" 
                        disabled={isLoading}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field" disabled={isLoading}>
                                <option value="PENDENTE">Pendente</option>
                                <option value="EM_PROGRESSO">Em Progresso</option>
                                <option value="CONCLUIDA">Concluída</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Prioridade</label>
                            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input-field" disabled={isLoading}>
                                <option value="ALTA">Alta</option>
                                <option value="MEDIA">Média</option>
                                <option value="BAIXA">Baixa</option>
                            </select>
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-3 text-slate-300 hover:bg-slate-700 rounded-xl font-semibold transition-colors">Cancelar</button>
                        <button type="submit" className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50" disabled={isLoading}>
                            {isLoading ? 'A guardar...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}