'use client';

import { useState } from 'react';

// --- Interfaces TypeScript para os nossos dados ---
interface DailyStat {
  day: string;
  tasks: number;
  pomodoros: number;
  productivity: number;
}

interface CategoryStat {
  category: string;
  completed: number;
  total: number;
  color: string;
}

interface TimeRangeData {
  tasksCompleted: number;
  tasksCreated: number;
  pomodoroSessions: number;
  productivityScore: number;
  averageTaskTime: number;
  dailyStats: DailyStat[];
  categoryStats: CategoryStat[];
}

// --- Componente da Página ---
export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  
  // Dados de exemplo (Mock data)
  const analyticsData: { week: TimeRangeData; month: TimeRangeData } = {
    week: {
      tasksCompleted: 24,
      tasksCreated: 32,
      pomodoroSessions: 18,
      productivityScore: 85,
      averageTaskTime: 2.5,
      dailyStats: [
        { day: 'Seg', tasks: 4, pomodoros: 3, productivity: 80 },
        { day: 'Ter', tasks: 6, pomodoros: 4, productivity: 90 },
        { day: 'Qua', tasks: 3, pomodoros: 2, productivity: 70 },
        { day: 'Qui', tasks: 5, pomodoros: 4, productivity: 85 },
        { day: 'Sex', tasks: 4, pomodoros: 3, productivity: 88 },
        { day: 'Sáb', tasks: 2, pomodoros: 2, productivity: 75 },
        { day: 'Dom', tasks: 0, pomodoros: 0, productivity: 0 }
      ],
      categoryStats: [
        { category: 'Desenvolvimento', completed: 12, total: 15, color: 'bg-blue-500' },
        { category: 'Design', completed: 8, total: 10, color: 'bg-purple-500' },
        { category: 'Reuniões', completed: 4, total: 5, color: 'bg-green-500' },
        { category: 'Documentação', completed: 0, total: 2, color: 'bg-yellow-500' }
      ]
    },
    month: {
      tasksCompleted: 96, tasksCreated: 120, pomodoroSessions: 72, productivityScore: 82, averageTaskTime: 2.8,
      dailyStats: [
        { day: 'Sem 1', tasks: 20, pomodoros: 15, productivity: 85 },
        { day: 'Sem 2', tasks: 25, pomodoros: 18, productivity: 88 },
        { day: 'Sem 3', tasks: 28, pomodoros: 20, productivity: 90 },
        { day: 'Sem 4', tasks: 23, pomodoros: 19, productivity: 82 }
      ],
      categoryStats: [
        { category: 'Desenvolvimento', completed: 45, total: 55, color: 'bg-blue-500' },
        { category: 'Design', completed: 30, total: 35, color: 'bg-purple-500' },
        { category: 'Reuniões', completed: 15, total: 20, color: 'bg-green-500' },
        { category: 'Documentação', completed: 6, total: 10, color: 'bg-yellow-500' }
      ]
    }
  };

  const currentData = analyticsData[timeRange];

  const getCompletionRate = () => Math.round((currentData.tasksCompleted / currentData.tasksCreated) * 100) || 0;
  const getMaxValue = (data: DailyStat[], key: 'tasks' | 'pomodoros') => Math.max(...data.map(item => item[key]), 0);

  return (
    <div className="space-y-8">
      {/* Header da Página */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics & Relatórios</h1>
          <p className="text-slate-400 mt-1">Acompanhe o seu desempenho e produtividade.</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month')}
            className="h-12 border border-slate-700 rounded-xl px-4 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
          </select>
          <button className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white px-5 font-semibold rounded-xl transition-colors flex items-center shadow-lg">
            <i className="bx bx-download mr-2 text-xl"></i>
            Exportar
          </button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon="bx-check-circle" color="blue" title="Tarefas Concluídas" value={currentData.tasksCompleted} subtitle={`${getCompletionRate()}% de conclusão`} />
        <MetricCard icon="bx-time-five" color="green" title="Sessões Pomodoro" value={currentData.pomodoroSessions} subtitle={`${Math.round(currentData.pomodoroSessions * 25 / 60)}h focadas`} />
        <MetricCard icon="bx-trending-up" color="purple" title="Score de Produtividade" value={`${currentData.productivityScore}%`} subtitle="Baseado em tarefas" />
        <MetricCard icon="bx-stopwatch" color="yellow" title="Tempo Médio/Tarefa" value={`${currentData.averageTaskTime}h`} subtitle="Tempo de conclusão" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Gráfico de Desempenho Diário */}
        <div className="lg:col-span-3 bg-slate-800 border border-slate-700 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Desempenho Diário</h2>
          <div className="space-y-4">
            {currentData.dailyStats.map((stat) => (
              <div key={stat.day} className="flex items-center gap-4 text-sm">
                <span className="w-10 text-slate-400 font-medium">{stat.day}</span>
                <div className="flex-1 bg-slate-700 rounded-full h-2.5">
                  <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${(stat.tasks / getMaxValue(currentData.dailyStats, 'tasks')) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desempenho por Categoria */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Desempenho por Categoria</h2>
          <div className="space-y-4">
            {currentData.categoryStats.map((cat) => (
              <div key={cat.category}>
                <div className="flex justify-between mb-1 text-sm font-medium text-slate-300">
                  <span>{cat.category}</span>
                  <span>{cat.completed}/{cat.total}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                  <div className={`${cat.color} h-2.5 rounded-full`} style={{ width: `${(cat.completed / cat.total) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Componente reutilizável para os cartões de métricas (colocado FORA do componente principal) ---
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