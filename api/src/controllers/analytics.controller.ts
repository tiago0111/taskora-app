import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getUserId(req: Request): number | null {
  const user = req.user as any;
  return (user && typeof user.userId === 'number') ? user.userId : null;
}

async function fetchAnalyticsData(userId: number) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [tasksCompleted, tasksCreated, pomodoroSessions, totalFocusTimeData] = await Promise.all([
      prisma.task.count({ where: { assigneeId: userId, status: 'CONCLUIDA', updatedAt: { gte: sevenDaysAgo } } }),
      prisma.task.count({ where: { assigneeId: userId, createdAt: { gte: sevenDaysAgo } } }),
      prisma.pomodoroSession.count({ where: { userId, mode: 'TRABALHO', createdAt: { gte: sevenDaysAgo } } }),
      prisma.pomodoroSession.aggregate({
        _sum: { duration: true },
        where: { userId, mode: 'TRABALHO', createdAt: { gte: sevenDaysAgo } },
      }),
    ]);
    
    const completionRate = tasksCreated > 0 ? (tasksCompleted / tasksCreated) : 0;
    const focusHours = (totalFocusTimeData._sum.duration || 0) / 3600;
    const productivityScore = Math.round(
      (completionRate * 60) + (Math.min(focusHours, 10) / 10 * 40)
    );

    const totalFocusSeconds = totalFocusTimeData._sum.duration || 0;
    return {
      tasksCompleted,
      pomodoroSessions,
      totalFocusTime: {
        seconds: totalFocusSeconds,
        minutes: Math.round(totalFocusSeconds / 60),
        hours: (totalFocusSeconds / 3600).toFixed(2),
      },
      productivityScore,
    };
}


export async function getAnalyticsSummary(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Não autorizado.' });
    }
    const summary = await fetchAnalyticsData(userId);
    res.status(200).json(summary);
  } catch (error) {
    console.error("Erro ao gerar o resumo de analytics:", error);
    res.status(500).json({ message: "Ocorreu um erro no servidor ao gerar o resumo." });
  }
}

export async function getDashboardData(req: Request, res: Response) {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ message: 'Não autorizado.' });
        }

        const [stats, recentTasks, recentProjects] = await Promise.all([
            fetchAnalyticsData(userId),
            prisma.task.findMany({
                where: { assigneeId: userId, status: { not: 'CONCLUIDA' } },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
            prisma.project.findMany({
                where: { ownerId: userId },
                orderBy: { createdAt: 'desc' },
                take: 3,
            })
        ]);

        res.status(200).json({
            stats,
            recentTasks,
            recentProjects,
        });

    } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        res.status(500).json({ message: "Ocorreu um erro no servidor." });
    }
}