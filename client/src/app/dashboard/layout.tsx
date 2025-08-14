'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface MenuItem {
  icon: string;
  label: string;
  href: string;
  badge?: string;
}

export default function DashboardLayout({
  children, // As suas páginas (Projetos, Tarefas, etc.) aparecerão aqui
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    { icon: 'bx-home-alt', label: 'Dashboard', href: '/dashboard' },
    { icon: 'bx-task', label: 'Tarefas', href: '/dashboard/tasks' },
    { icon: 'bx-folder-open', label: 'Projetos', href: '/dashboard/projects' },
    { icon: 'bx-columns', label: 'Kanban', href: '/dashboard/kanban' },
    { icon: 'bx-time-five', label: 'Pomodoro', href: '/dashboard/pomodoro' },
    { icon: 'bx-bar-chart-alt-2', label: 'Analytics', href: '/dashboard/analytics' },
    { icon: 'bx-cog', label: 'Configurações', href: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300">
      {/* === SIDEBAR === */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-20 px-4 border-b border-slate-700">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="Taskora Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-xl font-bold text-white tracking-tight">Taskora</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <i className={`bx ${item.icon} text-xl`}></i>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Overlay para fechar a sidebar em mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* === CONTEÚDO PRINCIPAL (com Header) === */}
      <div className="lg:pl-64">
        {/* Header (Top navigation) */}
        <header className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 border-b border-slate-700 bg-slate-900/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
            {/* ...código do header aqui... */}
        </header>

        {/* Conteúdo da Página */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}