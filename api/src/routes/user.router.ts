import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import  {updateUserProfile}  from '../controllers/user.controller';

const userRouter = Router();

userRouter.put('/profile',authMiddleware,updateUserProfile)

export default userRouter