'use client';

import { useState } from 'react';
import type { ReactNode, ChangeEvent } from 'react'; // 1. Importe o ChangeEvent

// --- Interfaces TypeScript ---
interface ProfileState {
  name: string;
  email: string;
  bio: string;
}

// --- Componente da Página Principal ---
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-8">
      {/* === Header da Página === */}
      <div>
        <h1 className="text-3xl font-bold text-white">Configurações</h1>
        <p className="text-slate-400 mt-1">Personalize a sua experiência no Taskora.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* === Sidebar de Navegação === */}
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* === Conteúdo da Tab Ativa === */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'preferences' && <PreferencesSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
        </div>
      </div>
    </div>
  );
}

// --- Componente da Sidebar de Configurações ---
function SettingsSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void; }) {
  const tabs = [
    { id: 'profile', label: 'Perfil', icon: 'bx-user' },
    { id: 'preferences', label: 'Preferências', icon: 'bx-cog' },
    { id: 'notifications', label: 'Notificações', icon: 'bx-bell' },
    { id: 'pomodoro', label: 'Pomodoro', icon: 'bx-time-five' },
    { id: 'security', label: 'Segurança', icon: 'bx-shield' },
  ];

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
      <nav className="space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-sm font-semibold ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <i className={`bx ${tab.icon} text-xl`}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// --- Componente para a Secção de Perfil ---
function ProfileSettings() {
  const [profile, setProfile] = useState<ProfileState>({
    name: 'Tiago Conceição',
    email: 'tiago@taskora.com',
    bio: 'Desenvolvedor Full Stack apaixonado por produtividade e tecnologia.',
  });

  return (
    <SettingsSection title="Informações do Perfil" description="Atualize a sua foto e detalhes pessoais.">
      <div className="flex items-center gap-6 border-b border-slate-700 pb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
          TO
        </div>
        <div>
          <button className="btn-secondary">Alterar Foto</button>
          <p className="text-xs text-slate-500 mt-2">JPG, PNG ou GIF. Máximo 2MB.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        {/* 2. Adicione o tipo aqui */}
        <FormInput label="Nome Completo" value={profile.name} onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({...profile, name: e.target.value})} />
        <FormInput label="Email" type="email" value={profile.email} onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({...profile, email: e.target.value})} />
      </div>
      <div className="pt-6">
        <label className="block text-sm font-semibold text-slate-300 mb-2">Biografia</label>
        <textarea 
          value={profile.bio} 
          // E aqui
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setProfile({...profile, bio: e.target.value})} 
          rows={3} 
          className="input-field"
        />
      </div>
    </SettingsSection>
  );
}

// --- Componente para a Secção de Preferências ---
function PreferencesSettings() {
  const [prefs, setPrefs] = useState({ theme: 'dark', startWeek: 'monday' });
  return (
    <SettingsSection title="Preferências da Aplicação" description="Personalize a aparência e o comportamento do Taskora.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* E aqui */}
            <FormSelect label="Tema" value={prefs.theme} onChange={(e: ChangeEvent<HTMLSelectElement>) => setPrefs({...prefs, theme: e.target.value})}>
                <option value="dark">Escuro</option>
                <option value="light">Claro</option>
                <option value="system">Sistema</option>
            </FormSelect>
             <FormSelect label="Início da Semana" value={prefs.startWeek} onChange={(e: ChangeEvent<HTMLSelectElement>) => setPrefs({...prefs, startWeek: e.target.value})}>
                <option value="monday">Segunda-feira</option>
                <option value="sunday">Domingo</option>
            </FormSelect>
        </div>
    </SettingsSection>
  );
}

// --- Componente para a Secção de Notificações ---
function NotificationSettings() {
  const [notifications, setNotifications] = useState({ email: true, push: true, weeklyReports: false });
  return (
    <SettingsSection title="Notificações" description="Escolha como e quando quer ser notificado.">
      <FormToggle 
        label="Notificações por Email" 
        description="Receber emails sobre atividade importante."
        enabled={notifications.email}
        setEnabled={(value) => setNotifications({...notifications, email: value})}
      />
      <FormToggle 
        label="Notificações Push" 
        description="Receber notificações push no seu dispositivo."
        enabled={notifications.push}
        setEnabled={(value) => setNotifications({...notifications, push: value})}
      />
      <FormToggle 
        label="Relatórios Semanais" 
        description="Receber um resumo da sua produtividade todas as semanas."
        enabled={notifications.weeklyReports}
        setEnabled={(value) => setNotifications({...notifications, weeklyReports: value})}
      />
    </SettingsSection>
  );
}

// --- Componentes Reutilizáveis para o Formulário (sem alterações aqui) ---
function SettingsSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="text-slate-400 mt-1">{description}</p>
      </div>
      <div className="p-6 space-y-6">
        {children}
        <div className="flex justify-end border-t border-slate-700 pt-6">
          <button className="btn-primary">Guardar Alterações</button>
        </div>
      </div>
    </div>
  );
}

function FormInput({ label, ...props }: { label: string; [key: string]: any }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-300 mb-2">{label}</label>
      <input {...props} className="input-field" />
    </div>
  );
}

function FormSelect({ label, children, ...props }: { label: string; children: ReactNode; [key: string]: any }) {
    return (
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">{label}</label>
        <select {...props} className="input-field">
            {children}
        </select>
      </div>
    );
}

function FormToggle({ label, description, enabled, setEnabled }: { label: string; description: string; enabled: boolean; setEnabled: (value: boolean) => void; }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-700 py-4 last:border-b-0">
      <div>
        <h3 className="font-semibold text-white">{label}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
      </label>
    </div>
  );
}