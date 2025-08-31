'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchWithAuth } from '@/utils/api';
// Importamos os tipos de Task e Project
import type { Task, Project } from '@/types';

// --- Interfaces TypeScript ---
interface Mode {
  id: 'work' | 'shortBreak' | 'longBreak';
  label: string;
  time: number;
  gradient: string;
  apiMode: 'TRABALHO' | 'PAUSA_CURTA' | 'PAUSA_LONGA';
}

// --- Componente da Página ---
export default function PomodoroPage() {
  const modes: Mode[] = [
    { id: 'work', label: 'Trabalho', time: 25 * 60, gradient: 'from-red-500 to-pink-600', apiMode: 'TRABALHO' },
    { id: 'shortBreak', label: 'Pausa Curta', time: 5 * 60, gradient: 'from-green-500 to-emerald-600', apiMode: 'PAUSA_CURTA' },
    { id: 'longBreak', label: 'Pausa Longa', time: 15 * 60, gradient: 'from-blue-500 to-cyan-600', apiMode: 'PAUSA_LONGA' },
  ];

  // --- Estados da Aplicação ---
  const [activeMode, setActiveMode] = useState<Mode['id']>('work');
  const selectedMode = modes.find(m => m.id === activeMode)!;
  const [timeLeft, setTimeLeft] = useState(selectedMode.time);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

 
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar todos os projetos e, em seguida, as tarefas do primeiro projeto
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const projectsResponse = await fetchWithAuth('/projects');
      const projectsData: Project[] = await projectsResponse.json();
      setProjects(projectsData);

      if (projectsData.length > 0) {
        const firstProjectId = projectsData[0].id;
        setSelectedProjectId(firstProjectId);

        const tasksResponse = await fetchWithAuth(`/projects/${firstProjectId}/tasks`);
        const tasksData: Task[] = await tasksResponse.json();
        setTasks(tasksData);
        if (tasksData.length > 0) {
          setSelectedTaskId(tasksData[0].id);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar projetos e tarefas:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Função para buscar tarefas quando o projeto selecionado muda
  const handleProjectChange = async (projectId: number) => {
    setSelectedProjectId(projectId);
    setTasks([]); // Limpa as tarefas antigas
    setSelectedTaskId(null); // Limpa a tarefa selecionada
    try {
      const tasksResponse = await fetchWithAuth(`/projects/${projectId}/tasks`);
      const tasksData: Task[] = await tasksResponse.json();
      setTasks(tasksData);
      if (tasksData.length > 0) {
        setSelectedTaskId(tasksData[0].id);
      }
    } catch (error) {
      console.error("Erro ao buscar tarefas do projeto:", error);
    }
  };

  // Função para guardar a sessão Pomodoro, agora com o taskId
  const savePomodoroSession = async (duration: number, mode: Mode['apiMode']) => {
    try {
      const body: { duration: number; mode: Mode['apiMode']; taskId?: number } = {
        duration,
        mode,
      };
      
      // Só adiciona o taskId ao pedido se uma tarefa estiver selecionada
      if (selectedTaskId) {
        body.taskId = selectedTaskId;
      }

      const response = await fetchWithAuth('/pomodoro/sessions', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Falha ao guardar a sessão Pomodoro.');
      console.log('Sessão Pomodoro guardada com sucesso!', body);
      
    } catch (error) {
      console.error('Erro ao guardar a sessão Pomodoro:', error);
    }
  };
  
  // Lógica do Temporizador com useEffect
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      alert("Sessão terminada!");
      savePomodoroSession(selectedMode.time, selectedMode.apiMode);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft, selectedMode, selectedTaskId]); // Adicionado selectedTaskId às dependências


  const progress = ((selectedMode.time - timeLeft) / selectedMode.time) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleModeChange = (modeId: Mode['id']) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActiveMode(modeId);
    setTimeLeft(modes.find(m => m.id === modeId)?.time || 0);
    setIsActive(false);
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsActive(false);
    setTimeLeft(selectedMode.time);
  };
  
  const todayStats = { completedSessions: 8, totalFocusTime: '3h 20m' };
  const recentSessions = [
    { id: 1, task: 'Design da interface principal', type: 'work' },
    { id: 2, task: 'Pausa curta', type: 'break' },
    { id: 3, task: 'Configurar base de dados', type: 'work' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Pomodoro Timer</h1>
        <p className="text-slate-400 mt-1">Maximize a sua produtividade com sessões focadas.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-lg p-6 space-y-6">
          <div className="flex items-center justify-center space-x-2 bg-slate-900 rounded-full p-2">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                className={`flex-1 py-3 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeMode === mode.id ? `bg-gradient-to-r ${mode.gradient} text-white shadow-lg transform scale-105` : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
          <div className="text-center pt-8 pb-12">
            <div className="relative w-72 h-72 lg:w-80 lg:h-80 mx-auto">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" fill="none" className="text-slate-700" />
                <circle cx="50" cy="50" r="45" stroke="url(#timerGradient)" strokeWidth="6" fill="none" strokeDasharray={`${2 * Math.PI * 45}`} strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`} className="transition-all duration-500 ease-linear" strokeLinecap="round" />
                <defs><linearGradient id="timerGradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" className="stop-color-pink-500" /><stop offset="100%" className="stop-color-red-500" /></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-7xl font-bold text-white font-mono tracking-tighter">{formatTime(timeLeft)}</div>
                  <div className="text-slate-400 font-medium">{selectedMode.label}</div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-center space-x-4">
              <button onClick={handleReset} className="w-16 h-16 bg-slate-700 text-slate-300 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center text-2xl"><i className='bx bx-reset'></i></button>
              <button onClick={() => setIsActive(!isActive)} className={`w-24 h-24 text-white rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center text-4xl bg-gradient-to-br ${selectedMode.gradient}`}><i className={`bx ${isActive ? 'bx-pause' : 'bx-play'}`}></i></button>
            </div>
          </div>

          {/* === INÍCIO: Seletor de Projetos e Tarefas === */}
          <div className="max-w-md mx-auto space-y-4">
              <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider text-center">Projeto</label>
                  <select
                      value={selectedProjectId || ''}
                      onChange={(e) => handleProjectChange(Number(e.target.value))}
                      className="input-field text-center"
                      disabled={isLoading}
                  >
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider text-center">Tarefa Atual</label>
                  <select
                      value={selectedTaskId || ''}
                      onChange={(e) => setSelectedTaskId(Number(e.target.value))}
                      className="input-field text-center"
                      disabled={isLoading || tasks.length === 0}
                  >
                      {tasks.length > 0 ? (
                          tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)
                      ) : (
                          <option>Nenhuma tarefa neste projeto</option>
                      )}
                  </select>
              </div>
          </div>
          {/* === FIM: Seletor de Projetos e Tarefas === */}

        </div>
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Estatísticas de Hoje</h3>
            <div className="space-y-4"><StatCard icon="bx-time-five" title="Sessões Concluídas" value={todayStats.completedSessions.toString()} color="text-green-400" /><StatCard icon="bx-brain" title="Tempo Focado" value={todayStats.totalFocusTime} color="text-purple-400" /></div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Sessões Recentes</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">{recentSessions.map((session) => (<div key={session.id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg"><div className={`w-2 h-2 rounded-full ${session.type === 'work' ? 'bg-red-500' : 'bg-green-500'}`}></div><p className="text-sm text-slate-300 truncate">{session.task}</p></div>))}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Componente Reutilizável para Cartões de Estatísticas ---
function StatCard({ icon, title, value, color }: { icon: string; title: string; value: string; color: string }) {
  return (<div className="flex items-center gap-4"><div className={`text-2xl p-2 bg-slate-700 rounded-lg ${color}`}><i className={`bx ${icon}`}></i></div><div><p className="text-slate-400 text-sm">{title}</p><p className="text-lg font-bold text-white">{value}</p></div></div>);
}