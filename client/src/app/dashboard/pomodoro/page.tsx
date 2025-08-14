'use client';

import { useState } from 'react';

// --- Interfaces TypeScript para os nossos dados ---
interface Mode {
  id: 'work' | 'shortBreak' | 'longBreak';
  label: string;
  time: number; // Armazenar tempo em segundos
  gradient: string;
}

// --- Componente da Página ---
export default function PomodoroPage() {
  const modes: Mode[] = [
    { id: 'work', label: 'Trabalho', time: 25 * 60, gradient: 'from-red-500 to-pink-600' },
    { id: 'shortBreak', label: 'Pausa Curta', time: 5 * 60, gradient: 'from-green-500 to-emerald-600' },
    { id: 'longBreak', label: 'Pausa Longa', time: 15 * 60, gradient: 'from-blue-500 to-cyan-600' },
  ];

  // --- Estados da Aplicação ---
  const [activeMode, setActiveMode] = useState<Mode['id']>('work');
  const [timeLeft, setTimeLeft] = useState(modes.find(m => m.id === 'work')?.time || 25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [currentTask, setCurrentTask] = useState('Implementar sistema de autenticação');

  const selectedMode = modes.find(m => m.id === activeMode)!;
  const progress = ((selectedMode.time - timeLeft) / selectedMode.time) * 100;

  // Função para formatar o tempo de segundos para MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleModeChange = (modeId: Mode['id']) => {
    setActiveMode(modeId);
    setTimeLeft(modes.find(m => m.id === modeId)?.time || 0);
    setIsActive(false); // Pausa o timer ao mudar de modo
  };

  return (
    <div className="space-y-8">
      {/* === Header da Página === */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Pomodoro Timer</h1>
          <p className="text-slate-400 mt-1">Maximize a sua produtividade com sessões focadas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* === Timer Principal === */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-lg p-6 space-y-6">
          {/* Seletor de Modo */}
          <div className="flex items-center justify-center space-x-2 bg-slate-900 rounded-full p-2">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                className={`flex-1 py-3 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeMode === mode.id
                    ? `bg-gradient-to-r ${mode.gradient} text-white shadow-lg transform scale-105`
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Display do Timer */}
          <div className="text-center pt-8 pb-12">
            <div className="relative w-72 h-72 lg:w-80 lg:h-80 mx-auto">
              {/* Anel de Progresso */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" fill="none" className="text-slate-700" />
                <circle
                  cx="50" cy="50" r="45" stroke="url(#timerGradient)" strokeWidth="6" fill="none"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  className="transition-all duration-500 ease-linear" strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" className="stop-color-pink-500" />
                    <stop offset="100%" className="stop-color-red-500" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Conteúdo do Timer */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-7xl font-bold text-white font-mono tracking-tighter">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-slate-400 font-medium">{selectedMode.label}</div>
                </div>
              </div>
            </div>
            
            {/* Botões de Ação */}
            <div className="mt-8 flex items-center justify-center space-x-4">
              <button 
                onClick={() => setIsActive(!isActive)}
                className={`w-24 h-24 text-white rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center text-4xl bg-gradient-to-br ${selectedMode.gradient}`}
              >
                <i className={`bx ${isActive ? 'bx-pause' : 'bx-play'}`}></i>
              </button>
            </div>
          </div>

          {/* Tarefa Atual */}
          <div className="max-w-md mx-auto">
            <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider text-center">
              Tarefa Atual
            </label>
            <input
              type="text"
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              className="block w-full px-4 py-3 border border-slate-600 rounded-lg text-center text-lg font-medium bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Em que está a trabalhar?"
            />
          </div>
        </div>

        {/* === Sidebar de Estatísticas === */}
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Estatísticas de Hoje</h3>
            <div className="space-y-4">
              <StatCard icon="bx-time-five" title="Sessões Concluídas" value="8" color="text-green-400" />
              <StatCard icon="bx-check-double" title="Tarefas Concluídas" value="5" color="text-blue-400" />
              <StatCard icon="bx-brain" title="Tempo Focado" value="3h 20m" color="text-purple-400" />
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Sessões Recentes</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {[
                { task: 'Design da interface', type: 'work' },
                { task: 'Pausa curta', type: 'break' },
                { task: 'Configurar base de dados', type: 'work' },
              ].map((session, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${session.type === 'work' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  <p className="text-sm text-slate-300 truncate">{session.task}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Componente Reutilizável para Cartões de Estatísticas ---
function StatCard({ icon, title, value, color }: { icon: string; title: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`text-2xl p-2 bg-slate-700 rounded-lg ${color}`}>
        <i className={`bx ${icon}`}></i>
      </div>
      <div>
        <p className="text-slate-400 text-sm">{title}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
    </div>
  );
}