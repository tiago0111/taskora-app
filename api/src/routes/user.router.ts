import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import  {updateUserProfile}  from '../controllers/user.controller';

const userRouter = Router();

// Adiciona o roleMiddleware para garantir que apenas administradores podem atualizar perfis
userRouter.put('/profile', authMiddleware, roleMiddleware(['ADMIN']), updateUserProfile)

export default userRouter