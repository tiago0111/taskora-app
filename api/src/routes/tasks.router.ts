import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { createTask, listTasks, updateTask, deleteTask } from '../controllers/tasks.controller';


const tasksRouter = Router();

tasksRouter.post('/', authMiddleware, createTask);
tasksRouter.get ('/',authMiddleware, listTasks);
tasksRouter.put ('/:taskId',authMiddleware, updateTask);
tasksRouter.delete('/:taskId', authMiddleware, deleteTask);


export default tasksRouter