'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth } from '@/utils/api';


interface AnalyticsSummary {
  tasksCompleted: number;
  pomodoroSessions: number;
  totalFocusTime: {
    seconds: number;
    minutes: number;
    hours: string;
  };
}


export default function AnalyticsPage() {
  // Estado para guardar os dados da API
  const [summaryData, setSummaryData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Função para ir buscar os dados 
  const fetchAnalyticsSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth('/analytics/summary');
      if (!response.ok) {
        throw new Error('Falha ao carregar os dados de analytics.');
      }
      const data: AnalyticsSummary = await response.json();
      setSummaryData(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // useEffect para chamar a função 
  useEffect(() => {
    fetchAnalyticsSummary();
  }, [fetchAnalyticsSummary]);


  if (isLoading) {
    return <p className="text-center text-slate-400 py-10">A carregar dados de analytics...</p>;
  }

  if (error || !summaryData) {
    return <p className="text-center text-red-400 py-10">{error || 'Não foi possível carregar os dados.'}</p>;
  }
  
  return (
    <div className="space-y-8">
      {/* Header da Página */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics & Relatórios</h1>
          <p className="text-slate-400 mt-1">Acompanhe o seu desempenho na última semana.</p>
        </div>
        <button className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white px-5 font-semibold rounded-xl transition-colors flex items-center shadow-lg">
          <i className="bx bx-download mr-2 text-xl"></i>
          Exportar
        </button>
      </div>

      {/* Métricas Principais - AGORA COM DADOS REAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon="bx-check-circle" color="blue" title="Tarefas Concluídas" value={summaryData.tasksCompleted} subtitle="Nos últimos 7 dias" />
        <MetricCard icon="bx-time-five" color="green" title="Sessões Pomodoro" value={summaryData.pomodoroSessions} subtitle="Sessões de trabalho" />
        <MetricCard icon="bx-brain" color="purple" title="Tempo Total Focado" value={`${summaryData.totalFocusTime.hours}h`} subtitle={`${summaryData.totalFocusTime.minutes} minutos`} />
        {/* Pode adicionar mais métricas aqui, como um score de produtividade calculado */}
        <MetricCard icon="bx-trending-up" color="yellow" title="Score de Produtividade" value="N/D" subtitle="Baseado em tarefas" />
      </div>

      {/* Adicione outros gráficos e visualizações aqui conforme necessário */}
    </div>
  );
}

// --- Componente reutilizável para os cartões de métricas ---
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