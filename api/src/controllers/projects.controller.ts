import { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';

const prisma = new PrismaClient();


export async function listProjects(req: Request, res: Response) {
  try {
   
    const userId = (req.user as any).userId;

    if (!userId) {
      return res.status(401).json({ message: 'ID do utilizador não encontrado no token.' });
    }

    // Usa o userId para ir à base de dados buscar apenas os projetos daquele utilizador.
    const projects = await prisma.project.findMany({
      where: {
        ownerId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Envia a lista de projetos encontrada como resposta.
    return res.status(200).json(projects);
  }

  catch (error) {
    console.error('Erro ao listar projetos:', error);
    return res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
  }
}

export async function createProject(req: Request, res: Response) {
  try {
    //  Extrai os dados do corpo do pedido
    const { name, description } = req.body;
    
    // Validação dos dados recebidos
    if (!name) {
      return res.status(400).json({ message: 'O nome do projeto é obrigatório.' });
    }

    //  Obtém o ID do utilizador a partir do token (adicionado pelo middleware)
    const userId = (req.user as any).userId;
    if (!userId) {
      return res.status(401).json({ message: 'Não foi possível identificar o utilizador para criar o projeto.' });
    }

    // Cria o projeto na base de dados usando o Prisma
    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: userId, // Associa o projeto ao utilizador logado
      },
    });

    // Envia o projeto recém-criado como resposta
    res.status(201).json(newProject);

  } 
  catch (error) {
    console.error("Erro ao criar projeto:", error);
    res.status(500).json({ message: "Ocorreu um erro no servidor ao tentar criar o projeto." });
  }


 
  
}

export async function updateProject(req: Request, res: Response) {
  try {
    // Extrair o ID do Projeto da URL e convertê-lo para número
    const projectId = parseInt(req.params.id, 10);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: 'ID do projeto inválido.' });
    }

    // Extrair os Novos Dados do corpo do pedido
    const { name, description, status } = req.body;

    //Obter o ID do Utilizador do token
    const userId = (req.user as any).userId;

    // VERIFICAÇÃO DE SEGURANÇA
    // Primeiro, encontramos o projeto para garantir que ele existe e pertence ao utilizador.
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado.' });
    }

    // Comparamos o dono do projeto com o utilizador que fez o pedido.
    if (project.ownerId !== userId) {
      // Se não for o dono, o acesso é proibido.
      return res.status(403).json({ message: 'Acesso negado. Não tem permissão para editar este projeto.' });
    }

    // Atualizar o Projeto na base de dados
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        name,
        description,
        status,
      },
    });

    // Enviar a Resposta com o projeto atualizado
    res.status(200).json(updatedProject);

  } catch (error) {
    console.error("Erro ao atualizar projeto:", error);
    res.status(500).json({ message: "Ocorreu um erro no servidor ao tentar atualizar o projeto." });
  }
}

export async function deleteProject(req: Request, res: Response) {
  try {
    // Extrair o ID do Projeto da URL e convertê-lo para número
    const projectId = parseInt(req.params.id, 10);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: 'ID do projeto inválido.' });
    }

    //Obter o ID do Utilizador do token
    const userId = (req.user as any).userId;
    if (!userId) {
      return res.status(401).json({ message: 'Não foi possível identificar o utilizador para eliminar o projeto.' });
    }

    // VERIFICAÇÃO DE SEGURANÇA
    // Primeiro, encontramos o projeto para garantir que ele existe e pertence ao utilizador.
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado.' });
    }

    // Comparamos o dono do projeto com o utilizador que fez o pedido.
    if (project.ownerId !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Não tem permissão para eliminar este projeto.' });
    }

    const deletedProject = await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    // Enviar a Resposta com o projeto eliminado
    res.status(204).send();

  } catch (error) {
    console.error("Erro ao apagar tarefa:", error);
    res.status(500).json({ message: "Ocorreu um erro no servidor ao tentar apagar a tarefa." });
  }
}
