import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAnalyticsSummary(req: Request, res: Response) {
  try {
    const userId = (req.user as any).userId;
    if (!userId) {
      return res.status(401).json({ message: 'Não autorizado.' });
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [tasksCompleted, pomodoroSessions, totalFocusTimeData] = await Promise.all([
      // Contar tarefas concluídas
      prisma.task.count({
        where: {
          assigneeId: userId,
          status: 'CONCLUIDA',
          updatedAt: {
            gte: sevenDaysAgo, 
          },
        },
      }),
     
      prisma.pomodoroSession.count({
        where: {
          userId: userId,
          mode: 'TRABALHO',
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),
      // Somar a duração de todas as sessões de trabalho
      prisma.pomodoroSession.aggregate({
        _sum: {
          duration: true, 
        },
        where: {
          userId: userId,
          mode: 'TRABALHO',
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),
    ]);
    
    // Objeto de Resposta
    const totalFocusSeconds = totalFocusTimeData._sum.duration || 0;
    const summary = {
      tasksCompleted: tasksCompleted,
      pomodoroSessions: pomodoroSessions,
      totalFocusTime: {
        seconds: totalFocusSeconds,
        minutes: Math.round(totalFocusSeconds / 60),
        hours: (totalFocusSeconds / 3600).toFixed(2),
      },
      period: {
        startDate: sevenDaysAgo.toISOString(),
        endDate: new Date().toISOString(),
      }
    };

  
    res.status(200).json(summary);

  } catch (error) {
    console.error("Erro ao gerar o resumo de analytics:", error);
    res.status(500).json({ message: "Ocorreu um erro no servidor ao gerar o resumo." });
  }
}

