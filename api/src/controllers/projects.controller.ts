import { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';

const prisma = new PrismaClient();

function getAuthUser(req: Request) {
  const user = req.user as any;
  if (!user || typeof user.userId !== 'number') return null;
  return user as { userId: number; role?: string };
}

export async function listProjects(req: Request, res: Response) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return res.status(401).json({ message: 'Utilizador não autenticado.' });
    }

    const projects = await prisma.project.findMany({
      where: { ownerId: auth.userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(projects);
  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    return res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
  }
}

export async function createProject(req: Request, res: Response) {
  try {
    const { name, description } = req.body ?? {};
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'O nome do projeto é obrigatório.' });
    }

    const auth = getAuthUser(req);
    if (!auth) {
      return res.status(401).json({ message: 'Não foi possível identificar o utilizador para criar o projeto.' });
    }

    const newProject = await prisma.project.create({
      data: {
        name,
        description: description ?? '',
        ownerId: auth.userId,
      },
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({ message: 'Ocorreu um erro no servidor ao tentar criar o projeto.' });
  }
}

export async function updateProject(req: Request, res: Response) {
  try {
    const projectId = Number(req.params.id);
    if (!Number.isFinite(projectId)) {
      return res.status(400).json({ message: 'ID do projeto inválido.' });
    }

    const { name, description, status } = req.body ?? {};

    const auth = getAuthUser(req);
    if (!auth) return res.status(401).json({ message: 'Utilizador não autenticado.' });

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: 'Projeto não encontrado.' });

    if (project.ownerId !== auth.userId && auth.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado. Não tem permissão para editar este projeto.' });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { name, description, status },
    });

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.status(500).json({ message: 'Ocorreu um erro no servidor ao tentar atualizar o projeto.' });
  }
}

export async function deleteProject(req: Request, res: Response) {
  try {
    const projectId = Number(req.params.id);
    if (!Number.isFinite(projectId)) {
      return res.status(400).json({ message: 'ID do projeto inválido.' });
    }

    const auth = getAuthUser(req);
    if (!auth) {
      return res.status(401).json({ message: 'Não foi possível identificar o utilizador para eliminar o projeto.' });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: 'Projeto não encontrado.' });

    if (project.ownerId !== auth.userId && auth.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado. Não tem permissão para eliminar este projeto.' });
    }

    await prisma.project.delete({ where: { id: projectId } });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao apagar projeto:', error);
    res.status(500).json({ message: 'Ocorreu um erro no servidor ao tentar apagar o projeto.' });
  }
}