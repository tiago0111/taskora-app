'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/utils/api'; // Alterado
import type { Task, Project } from '@/types';

// Interface para os dados completos do dashboard
interface DashboardData {
  stats: {
    tasksCompleted: number;
    pomodoroSessions: number;
    totalFocusTime: {
      hours: string;
    };
    productivityScore: number;
  };
  recentTasks: Task[];
  recentProjects: Project[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Alterado para usar a nova função 'api'
      const response = await api('/analytics/dashboard', { auth: true });
      if (!response.ok) {
        throw new Error('Falha ao carregar os dados do dashboard.');
      }
      const dashboardData: DashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return <p className="text-center text-slate-400 py-10">A carregar dashboard...</p>;
  }

  if (error || !data) {
    return <p className="text-center text-red-400 py-10">{error || 'Não foi possível carregar os dados do dashboard.'}</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Aqui está um resumo da sua atividade recente.</p>
      </div>

      {/* Grelha de Estatísticas Reutilizada */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon="bx-check-circle" color="blue" title="Tarefas Concluídas" value={data.stats.tasksCompleted} subtitle="Últimos 7 dias" />
        <MetricCard icon="bx-time-five" color="green" title="Sessões Pomodoro" value={data.stats.pomodoroSessions} subtitle="Últimos 7 dias" />
        <MetricCard icon="bx-brain" color="purple" title="Tempo Focado" value={`${data.stats.totalFocusTime.hours}h`} subtitle="Últimos 7 dias" />
        <MetricCard icon="bx-trending-up" color="yellow" title="Score de Produtividade" value={`${data.stats.productivityScore}%`} subtitle="Performance" />
      </div>

      {/* Conteúdo Principal: Tarefas e Projetos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6">As suas Tarefas Ativas</h2>
          <div className="space-y-4">
            {data.recentTasks.length > 0 ? (
              data.recentTasks.map((task) => (
                <div key={task.id} className="bg-slate-700/50 p-4 rounded-lg flex justify-between items-center">
                  <span className="font-medium text-white">{task.title}</span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-300`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-4">Não tem tarefas ativas. Bom trabalho!</p>
            )}
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6">Projetos Recentes</h2>
          <div className="space-y-5">
            {data.recentProjects.length > 0 ? (
              data.recentProjects.map((project) => (
                <div key={project.id} className="flex items-center gap-4">
                  <div className="w-2 h-8 rounded" style={{ backgroundColor: project.color || '#7c3aed' }}></div>
                  <div>
                    <p className="font-semibold text-white">{project.name}</p>
                    <p className="text-sm text-slate-400">{project.status}</p>
                  </div>
                </div>
              ))
            ) : (
               <p className="text-slate-500 text-center py-4">Ainda não criou nenhum projeto.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de métrica reutilizado
function MetricCard({ icon, color, title, value, subtitle }: { icon: string; color: string; title: string; value: string | number; subtitle: string }) {
    const colors: { [key: string]: string } = {
      blue: 'bg-blue-900/20 text-blue-400',
      green: 'bg-green-900/20 text-green-400',
      purple: 'bg-purple-900/20 text-purple-400',
      yellow: 'bg-yellow-900/20 text-yellow-400',
    };
  
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-xl ${colors[color]}`}>
            <i className={`bx ${icon} text-2xl`}></i>
          </div>
          <div className="ml-4">
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
      </div>
    );
}