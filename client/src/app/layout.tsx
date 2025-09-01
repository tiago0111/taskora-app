import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "Taskora - Gestão de Tarefas e Produtividade",
  description: "Plataforma moderna de gestão de tarefas com Kanban Board, Pomodoro Timer e Dashboard Analytics",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={inter.className}>
      <head>
        <link
          href="https://unpkg.com/boxicons@2.1.2/css/boxicons.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Toaster 
          position="top-right"
          toastOptions={{
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