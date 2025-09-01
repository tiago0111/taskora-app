// api/src/controllers/tasks.controller.ts

import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getAuthUser(req: Request) {
  const user = req.user as any;
  if (!user || typeof user.userId !== 'number') return null;
  return user as { userId: number; role?: string };
}

// ... (as suas funções createTask e listTasks permanecem iguais)
export async function createTask(req: Request, res: Response) {
  try {
    const projectId = Number(req.params.projectId);
    const auth = getAuthUser(req);
    if (!auth) return res.status(401).json({ message: 'Utilizador não autenticado.' });

    const { title, description, assigneeId } = req.body ?? {};

    if (!Number.isFinite(projectId)) {
      return res.status(400).json({ message: 'ID do projeto inválido.' });
    }
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ message: 'O título da tarefa é obrigatório.' });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: 'Projeto não encontrado.' });

    // Dono do projeto pode criar
    if (project.ownerId !== auth.userId) {
      return res.status(403).json({ message: 'Acesso negado. Não tem permissão para adicionar tarefas a este projeto.' });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description: description ?? '',
        projectId,
        assigneeId: assigneeId ?? auth.userId,
      },
      include: { project: true, assignee: true },
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ message: 'Ocorreu um erro no servidor ao tentar criar a tarefa.' });
  }
}

export async function listTasks(req: Request, res: Response) {
  try {
    const projectId = Number(req.params.projectId);
    const auth = getAuthUser(req);
    if (!auth) return res.status(401).json({ message: 'Utilizador não autenticado.' });

    if (!Number.isFinite(projectId)) {
      return res.status(400).json({ message: 'ID do projeto inválido.' });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: 'Projeto não encontrado.' });

    if (project.ownerId !== auth.userId) {
      return res.status(403).json({ message: 'Acesso negado. Não tem permissão para aceder a este projeto.' });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: { project: true, assignee: true },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    res.status(500).json({ message: 'Ocorreu um erro no servidor ao tentar ler as tarefas.' });
  }
}


export async function updateTask(req: Request, res: Response) {

  console.log(`\n\n\n[DEBUG] CHEGUEI À FUNÇÃO updateTask às ${new Date().toLocaleTimeString()}`);
  console.log('[DEBUG] Parâmetros recebidos (req.params):', req.params);
  console.log('[DEBUG] Corpo do pedido (req.body):', req.body);

  try {
   
    const projectId = Number(req.params.projectId);
    const taskId = Number(req.params.taskId);
    const auth = getAuthUser(req);

    if (!auth) {
      return res.status(401).json({ message: 'Utilizador não autenticado.' });
    }

    if (!Number.isFinite(projectId) || !Number.isFinite(taskId)) {
      console.error('[DEBUG] ERRO: ID do projeto ou da tarefa inválido.');
      return res.status(400).json({ message: 'ID do projeto ou da tarefa inválido.' });
    }

    const { title, description, status, priority } = req.body ?? {};

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

    if (task.project.ownerId !== auth.userId && auth.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    const dataToUpdate: any = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (status !== undefined) dataToUpdate.status = status;
    if (priority !== undefined) dataToUpdate.priority = priority;


    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: dataToUpdate,
      include: { project: true, assignee: true },
    });

    console.log('[DEBUG] SUCESSO: Tarefa atualizada na base de dados.');
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('[DEBUG] Erro CRÍTICO ao atualizar tarefa:', error);
    res.status(500).json({ message: 'Ocorreu um erro no servidor ao tentar atualizar a tarefa.' });
  }
}
export async function deleteTask(req: Request, res: Response) {
  try {
    const projectId = Number(req.params.projectId);
    const taskId = Number(req.params.taskId);
    const auth = getAuthUser(req);
    if (!auth) return res.status(401).json({ message: 'Utilizador não autenticado.' });

    if (!Number.isFinite(projectId) || !Number.isFinite(taskId)) {
      return res.status(400).json({ message: 'ID do projeto ou da tarefa inválido.' });
    }

    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { project: true } });
    if (!task) return res.status(404).json({ message: 'Tarefa não encontrada.' });
    if (task.projectId !== projectId) {
      return res.status(400).json({ message: 'A tarefa não pertence a este projeto.' });
    }

    if (task.project.ownerId !== auth.userId && auth.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado. Não tem permissão para eliminar esta tarefa.' });
    }

    await prisma.task.delete({ where: { id: taskId } });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao apagar tarefa:', error);
    res.status(500).json({ message: 'Ocorreu um erro no servidor ao tentar apagar a tarefa.' });
  }
}