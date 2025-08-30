import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { createTask } from '../controllers/tasks.controller';
import { listTasks } from '../controllers/tasks.controller';
import { updateTask } from '../controllers/tasks.controller';


const tasksRouter = Router();

tasksRouter.post('/', authMiddleware, createTask)
tasksRouter.get ('/',authMiddleware, listTasks)
tasksRouter.put ('/',authMiddleware, updateTask)


export default tasksRouter