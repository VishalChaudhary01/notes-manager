import { Router } from 'express';
import authRoutes from './auth.route';
import { authRequire } from '../middlewares/auth-require';
import userRoutes from './user.route';
import noteRoutes from './notes.route';

const appRoutes = Router();

appRoutes.use('/auth', authRoutes);
appRoutes.use('/user', authRequire, userRoutes);
appRoutes.use('/notes', authRequire, noteRoutes);

export default appRoutes;
