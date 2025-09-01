import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { getAllUsers, createUser, updateUserById } from '../controllers/users.controller';

const usersRouter = Router();


usersRouter.use(authMiddleware, roleMiddleware(['ADMIN']));

usersRouter.get('/', getAllUsers);
usersRouter.post('/', createUser);
usersRouter.put('/:id', updateUserById);

export default usersRouter;