import { Router } from 'express';
import authRoutes from './auth.route';
import { authRequire } from '../middlewares/auth-require';
import userRoutes from './user.route';

const appRoutes = Router();

appRoutes.use('/auth', authRoutes);
appRoutes.use('/user', authRequire, userRoutes);

export default appRoutes;
