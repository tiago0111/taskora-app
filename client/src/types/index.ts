export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
  progress: number;
  endDate: string | null;
  color: string | null;
}

export interface Task {
  id: number;
  title: string;
  description: string | null; 
  status: string;           
  priority: string;           
  dueDate: string | null;    
  category: string | null;

 
  assignee: {
    id: number;
    name: string;
  };
}