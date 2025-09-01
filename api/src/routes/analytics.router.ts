import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getAnalyticsSummary, getDashboardData } from '../controllers/analytics.controller'; // Importar a nova função

const analyticsRouter = Router();

analyticsRouter.get('/summary', authMiddleware, getAnalyticsSummary)

analyticsRouter.get('/dashboard', authMiddleware, getDashboardData);

export default analyticsRouter;