import { Router } from 'express';
import { getProfile } from '../controllers/user.controller';

const userRoutes = Router();

userRoutes.get('/profile', getProfile);

export default userRoutes;
