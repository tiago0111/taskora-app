import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function updateUserProfile(req: Request, res: Response) {
  try {
    const userId = (req.user as any).userId;
    const userRole = (req.user as any).role;
    if (!userId) {
      return res.status(401).json({ message: 'Não autorizado.' });
    }

    // Extrair os dados que podem ser atualizados do corpo do pedido
    const { name, bio } = req.body;

    // Apenas administradores podem atualizar perfis
    if (userRole !== 'ADMIN') {
        return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem alterar perfis.' });
    }

    // Atualizar o utilizador na base de dados
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
        bio,
      },
      
      select: { // Diz ao Prisma para devolver APENAS estes campos
        id: true,
        email: true,
        name: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    
    res.status(200).json(updatedUser);

  } catch (error) {
  
    console.error("Erro ao atualizar o perfil:", error);
    res.status(500).json({ message: "Ocorreu um erro no servidor ao tentar atualizar o perfil." });
  }
}