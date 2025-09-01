import "./globals.css";

import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: "Taskora - Gestão de Tarefas e Produtividade",
  description: "Plataforma moderna de gestão de tarefas com Kanban Board, Pomodoro Timer e Dashboard Analytics",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <head>
        <link
          href="https://unpkg.com/boxicons@2.1.2/css/boxicons.min.css"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Toaster 
          position="top-right"
          toastOptions={{
            className: '',
            style: {
              background: '#2d3748', 
              color: '#cbd5e0', 
              border: '1px solid #4a5568', 
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}