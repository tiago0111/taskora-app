import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { listProjects } from '../controllers/projects.controller';
import { createProject } from '../controllers/projects.controller';
import { updateProject } from '../controllers/projects.controller';
import { deleteProject } from '../controllers/projects.controller';
import  tasksRouter  from './tasks.router';


 const projectsRouter = Router();

projectsRouter.get('/', authMiddleware, listProjects);
projectsRouter.post('/', authMiddleware, createProject);
projectsRouter.put('/:id', authMiddleware,updateProject); 
projectsRouter.delete('/:id', authMiddleware,deleteProject); 
projectsRouter.use('/:projectId/tasks', tasksRouter);


export  default projectsRouter;