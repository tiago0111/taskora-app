import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createTask(req: Request, res: Response) {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    const userId = (req.user as any).userId;

    const { title, description, assigneeId } = req.body;

    // Validação dos dados essenciais
    if (!title) {
      return res.status(400).json({ message: 'O título da tarefa é obrigatório.' });
    }
    if (isNaN(projectId)) {
      return res.status(400).json({ message: 'ID do projeto inválido.' });
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