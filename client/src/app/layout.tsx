import "./globals.css";
//import { ToastProvider } from "../../components/Toast";

export const metadata = {
  title: "Taskora - Gestão de Tarefas e Produtividade",
  description: "Plataforma moderna de gestão de tarefas com Kanban Board, Pomodoro Timer e Dashboard Analytics",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {  return (
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
        {children}
      </body>
    </html>
  );
}