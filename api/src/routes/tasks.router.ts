import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { createTask } from '../controllers/tasks.controller';

const tasksRouter = Router();

tasksRouter.post('/', authMiddleware, createTask)


export default tasksRouter;