import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { createPomodoroSession } from '../controllers/pomodoro.controller';

const pomodoroRouter = Router();

pomodoroRouter.post ('/sessions', authMiddleware, createPomodoroSession);

export default pomodoroRouter;