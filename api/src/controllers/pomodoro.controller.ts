import type { Request, Response } from 'express';
import { PrismaClient, PomodoroMode } from '@prisma/client';

const prisma = new PrismaClient();

export async function createPomodoroSession(req: Request, res: Response) {
  try {
    
    const userId = (req.user as any).userId;
    if (!userId) {
      return res.status(401).json({ message: 'Não autorizado.' });
    }

    const { duration, mode, taskId } = req.body;

    //  Validação 
    if (typeof duration !== 'number' || !mode) {
      return res.status(400).json({ message: 'Os campos "duration" (número) e "mode" (string) são obrigatórios.' });
    }

    // Validação robusta para garantir que o 'mode' corresponde ao Enum do Prisma
    const isValidMode = Object.values(PomodoroMode).includes(mode);
    if (!isValidMode) {
      return res.status(400).json({
        message: 'O valor de "mode" é inválido.',
        allowedModes: Object.values(PomodoroMode)
      });
    }

    const dataToCreate: any = {
      duration,
      mode,
      userId: userId,
    };

    // Adicionamos o taskId se ele for fornecido e válido
    if (taskId && typeof taskId === 'number') {
      dataToCreate.taskId = taskId;
    }

    const newSession = await prisma.pomodoroSession.create({
      data: dataToCreate,
    });
    
    res.status(201).json(newSession);

  } catch (error) {
    console.error("Erro ao criar sessão Pomodoro:", error);
    res.status(500).json({ message: "Ocorreu um erro no servidor ao tentar criar a sessão." });
  }
}