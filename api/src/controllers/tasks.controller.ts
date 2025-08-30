import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createTask(req: Request, res: Response) {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    const userId = (req.user as any).userId;

    const { title, description, assigneeId } = req.body;

    // Validação dos dados essenciais
    if (isNaN(projectId)) {
      return res.status(400).json({ message: 'ID do projeto inválido.' });
    }
    if (!title) {
      return res.status(400).json({ message: 'O título da tarefa é obrigatório.' });
    }

    // VERIFICAÇÃO DE SEGURANÇA
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado.' });
    }

    // Apenas o dono do projeto pode adicionar tarefas
    if (project.ownerId !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Não tem permissão para adicionar tarefas a este projeto.' });
    }

    // Criar a Tarefa na base de dados
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        projectId: projectId,
        assigneeId: assigneeId || userId,
      },
    });

   
    res.status(201).json(newTask);

  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    res.status(500).json({ message: "Ocorreu um erro no servidor ao tentar criar a tarefa." });
  }
}

export async function listTasks ( req : Request , res : Response ) {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: 'ID do projeto inválido.' });
    }
    
    const userId = (req.user as any).userId;
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado.' });
    }
    if (project.ownerId !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Não tem permissão para adicionar tarefas a este projeto.' });
    }
    const tasks = await prisma.task.findMany({
      where: {projectId},
       include: { project: true }, 

    })
    res.status(200).json(tasks);
    }
    

    catch (error) {
    console.error("Erro ao criar tarefa:", error);
    res.status(500).json({ message: "Ocorreu um erro no servidor ao tentar ler a tarefa." });

  }
}

export async function updateTask(req: Request, res: Response) {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    const taskId = parseInt(req.params.taskId, 10);
    const userId = (req.user as any).userId;

    if (isNaN(projectId) || isNaN(taskId)) {
      return res.status(400).json({ message: 'ID do projeto ou da tarefa inválido.' });
    }

    const { title, description, status, priority } = req.body;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true }, 
    });

    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

   
    if (task.projectId !== projectId) {
        return res.status(400).json({ message: 'A tarefa não pertence a este projeto.' });
    }
    
   
    if (task.project.ownerId !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Não tem permissão para editar tarefas neste projeto.' });
    }

  
    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        title,
        description,
        status,
        priority,
      },
    });

   
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    res.status(500).json({ message: "Ocorreu um erro no servidor ao tentar atualizar a tarefa." });
  }
}

export async function deleteTask(req: Request, res: Response) {
  try {
   
    const projectId = parseInt(req.params.projectId, 10);
    const taskId = parseInt(req.params.taskId, 10);
    const userId = (req.user as any).userId;

    if (isNaN(projectId) || isNaN(taskId)) {
      return res.status(400).json({ message: 'ID do projeto ou da tarefa inválido.' });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }
    if (task.projectId !== projectId) {
      return res.status(400).json({ message: 'A tarefa não pertence a este projeto.' });
    }
    if (task.project.ownerId !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Não tem permissão para apagar tarefas neste projeto.' });
    }

   
    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

   
    res.status(204).send();

  } catch (error) {
    console.error("Erro ao apagar tarefa:", error);
    res.status(500).json({ message: "Ocorreu um erro no servidor ao tentar apagar a tarefa." });
  }
}