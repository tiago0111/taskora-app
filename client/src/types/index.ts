// Definimos os tipos de Status e Prioridade aqui para serem usados em toda a aplicação
export type TaskStatus = 'PENDENTE' | 'EM_PROGRESSO' | 'EM_REVISAO' | 'CONCLUIDA';
export type TaskPriority = 'ALTA' | 'MEDIA' | 'BAIXA';

export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
  progress: number;
  endDate: string | null;
  color: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  bio: string | null;
  // Adicionamos a password como um campo opcional
  password?: string; 
}

export interface Task {
  id: number;
  title: string;
  description: string | null; 
  status: TaskStatus;           
  priority: TaskPriority;           
  dueDate: string | null;    
  category: string | null;
 
  assignee: {
    id: number;
    name: string;
  };
}