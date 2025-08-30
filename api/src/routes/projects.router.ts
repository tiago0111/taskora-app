import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { listProjects, createProject, updateProject, deleteProject } from '../controllers/projects.controller';
import  tasksRouter  from './tasks.router';


 const projectsRouter = Router();

projectsRouter.get('/', authMiddleware, listProjects);
projectsRouter.post('/', authMiddleware, createProject);
projectsRouter.put('/:id', authMiddleware,updateProject); 
projectsRouter.delete('/:id', authMiddleware,deleteProject); 
projectsRouter.use('/:projectId/tasks', tasksRouter);


export  default projectsRouter;