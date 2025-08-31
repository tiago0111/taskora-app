import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getAnalyticsSummary } from '../controllers/analytics.controller';

const analyticsRouter = Router();


analyticsRouter.get('/summary', authMiddleware, getAnalyticsSummary)

export default analyticsRouter;