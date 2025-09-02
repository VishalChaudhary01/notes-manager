import { Router } from 'express';
import { authRoutes } from './auth.route';

export const appRoutes = Router();

appRoutes.use('/auth', authRoutes);
