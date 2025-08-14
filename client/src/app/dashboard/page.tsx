'use client';

import { useState } from 'react';

// Tipagem para os nossos objetos (boa prática em TypeScript)
interface Task {
  id: number;
  title: string;
  status: 'Concluída' | 'Em progresso' | 'Pendente';
  progress: number;
}

interface Stat {
  title: string;
  value: string;
  change: string;
  icon: string;
  gradient: string;
}

export default function DashboardPage() {
  // Dados de exemplo para as estatísticas
  const stats: Stat[] = [
    { title: 'Tarefas Totais', value: '247', change: '+12%', icon: 'bx-task', gradient: 'from-blue-500 to-blue-600' },
    { title: 'Concluídas', value: '189', change: '+8%', icon: 'bx-check-circle', gradient: 'from-green-500 to-green-600' },
    { title: 'Sessões Pomodoro', value: '42', change: '+23%', icon: 'bx-time-five', gradient: 'from-orange-500 to-orange-600' },
    { title: 'Produtividade', value: '94%', change: '+5%', icon: 'bx-trending-up', gradient: 'from-purple-500 to-purple-600' },
  ];

  // A lista de tarefas agora é gerida pelo estado
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Implementar dashboard analytics', status: 'Em progresso', progress: 75 },
    { id: 2, title: 'Configurar Firebase Authentication', status: 'Concluída', progress: 100 },
    { id: 3, title: 'Design da nova sidebar', status: 'Concluída', progress: 100 },
    { id: 4, title: 'Implementar testes unitários', status: 'Pendente', progress: 0 },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle,
      status: 'Pendente',
      progress: 0,
    };
    setTasks([newTask, ...tasks]); // Adiciona a nova tarefa no início da lista
    setNewTaskTitle('');
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <main className="p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* === Secção de Boas-Vindas === */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-xl p-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Olá, Tiago! 👋</h1>
              <p className="text-slate-400 text-lg">Aqui está o resumo da sua produtividade hoje.</p>
            </div>
            <button className="mt-4 md:mt-0 px-5 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Adicionar Nova Tarefa
            </button>
          </div>
        </div>

        {/* === Grelha de Estatísticas === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.title} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex items-center gap-6 hover:bg-slate-700/50 transition-colors duration-300">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                <i className={`bx ${stat.icon}`}></i>
              </div>
              <div>
                <p className="text-slate-400 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* === Conteúdo Principal: Tarefas e Ações === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Coluna de Tarefas Recentes (maior) */}
          <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">Tarefas Recentes</h2>
            
            <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Qual a sua próxima tarefa?"
                className="p-3 border border-slate-600 rounded-lg flex-grow bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button type="submit" className="px-5 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                Adicionar
              </button>
            </form>

            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="bg-slate-700/50 p-4 rounded-lg flex justify-between items-center">
                  <span className="font-medium">{task.title}</span>
                  <div className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    task.status === 'Concluída' ? 'bg-green-500/20 text-green-300' :
                    task.status === 'Em progresso' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-slate-600 text-slate-300'
                  }`}>
                    {task.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Coluna de Atividade (menor) */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">Atividade Recente</h2>
            <div className="space-y-5">
              {[
                { action: 'Tarefa concluída', item: 'Design da sidebar', time: '2h atrás', icon: 'bx-check-circle', color: 'text-green-400' },
                { action: 'Nova tarefa criada', item: 'Implementar API', time: '4h atrás', icon: 'bx-plus-circle', color: 'text-blue-400' },
                { action: 'Sessão Pomodoro', item: '25 min de foco', time: '6h atrás', icon: 'bx-time-five', color: 'text-orange-400' }
              ].map((activity) => (
                <div key={activity.item} className="flex items-center gap-4">
                  <div className={`text-2xl ${activity.color}`}><i className={`bx ${activity.icon}`}></i></div>
                  <div>
                    <p className="font-semibold">{activity.action}</p>
                    <p className="text-sm text-slate-400">{activity.item}</p>
                  </div>
                  <p className="text-xs text-slate-500 ml-auto">{activity.time}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}