'use client';

import type { ReactNode } from 'react';

// --- Componente da Página ---
export default function ComponentsShowcasePage() {
  return (
    <div className="space-y-12">
      {/* === Header da Página === */}
      <div>
        <h1 className="text-4xl font-bold text-white">Biblioteca de Componentes</h1>
        <p className="text-slate-400 mt-2 text-lg">
          Showcase dos componentes estilizados do sistema Taskora.
        </p>
      </div>

      {/* === Secção de Botões === */}
      <ShowcaseSection title="Botões">
        <div className="flex flex-wrap items-center gap-4">
          <button className="btn-primary">Primário</button>
          <button className="btn-secondary">Secundário</button>
          <button className="btn-danger">Perigo</button>
          <button className="btn-success">Sucesso</button>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-6">
          <button className="btn-primary"><i className="bx bx-plus mr-2"></i>Com Ícone</button>
          <button className="btn-secondary"><i className="bx bx-edit mr-2"></i>Com Ícone</button>
          <button className="btn-danger"><i className="bx bx-trash mr-2"></i>Com Ícone</button>
        </div>
      </ShowcaseSection>
      
      {/* === Secção de Cartões === */}
      <ShowcaseSection title="Cartões de Estatísticas">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard icon="bx-task" color="blue" title="Tarefas" value="24" />
            <StatCard icon="bx-check-circle" color="green" title="Concluídas" value="18" />
            <StatCard icon="bx-time-five" color="purple" title="Tempo Focado" value="4.2h" />
        </div>
      </ShowcaseSection>

      {/* === Secção de Formulários === */}
      <ShowcaseSection title="Formulários">
        <div className="max-w-xl space-y-4">
            <input type="text" placeholder="Input de texto..." className="input-field" />
            <textarea placeholder="Área de texto..." rows={3} className="input-field"></textarea>
            <select className="input-field">
              <option>Selecione uma opção</option>
              <option>Opção 1</option>
            </select>
        </div>
      </ShowcaseSection>

      {/* === Secção de Badges e Tags === */}
      <ShowcaseSection title="Badges e Tags">
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge-blue">Desenvolvimento</span>
          <span className="badge-green">Concluído</span>
          <span className="badge-yellow">Planeamento</span>
          <span className="badge-purple">Design</span>
          <span className="badge-red">Alta Prioridade</span>
        </div>
      </ShowcaseSection>

      {/* === Secção de Notificações === */}
      <ShowcaseSection title="Notificações">
        <div className="space-y-4">
          <Notification type="success" title="Sucesso!" message="A sua tarefa foi guardada com sucesso." />
          <Notification type="error" title="Erro!" message="Não foi possível guardar as alterações. Tente novamente." />
        </div>
      </ShowcaseSection>
    </div>
  );
}

// --- Componentes Reutilizáveis para esta página (boa prática) ---

// Componente para criar as secções
function ShowcaseSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-6 border-b-2 border-slate-700 pb-2">{title}</h2>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
        {children}
      </div>
    </section>
  );
}

// Componente para os cartões de estatísticas
function StatCard({ icon, color, title, value }: { icon: string; color: 'blue' | 'green' | 'purple'; title: string; value: string | number; }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
  };
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex items-center gap-6">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl bg-gradient-to-br ${colors[color]} shadow-lg`}>
        <i className={`bx ${icon}`}></i>
      </div>
      <div>
        <p className="text-slate-400 text-sm">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

// Componente para as notificações
function Notification({ type, title, message }: { type: 'success' | 'error'; title: string; message: string; }) {
  const colors = {
    success: { icon: 'bx-check-circle', text: 'text-green-300', bg: 'bg-green-500/20', border: 'border-green-500' },
    error: { icon: 'bx-error-circle', text: 'text-red-300', bg: 'bg-red-500/20', border: 'border-red-500' },
  };
  const config = colors[type];

  return (
    <div className={`flex items-start gap-4 p-4 rounded-2xl border ${config.bg} ${config.border}`}>
      <i className={`bx ${config.icon} text-2xl mt-0.5 ${config.text}`}></i>
      <div>
        <h3 className="font-bold text-white">{title}</h3>
        <p className="text-slate-300 text-sm">{message}</p>
      </div>
    </div>
  );
}