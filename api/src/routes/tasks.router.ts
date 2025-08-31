import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { createTask, listTasks, updateTask, deleteTask } from '../controllers/tasks.controller';

{ mergeParams: true } 
const tasksRouter = Router({ mergeParams: true });


tasksRouter.post('/', createTask);
tasksRouter.get('/', listTasks);
tasksRouter.put('/:taskId', updateTask);
tasksRouter.delete('/:taskId', deleteTask);

export default tasksRouter;