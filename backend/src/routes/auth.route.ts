import { Router } from 'express';
import {
  resendVerificationToken,
  signin,
  signout,
  signup,
  verifyEmail,
} from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import {
  signinSchema,
  signupSchema,
  verifyEmailSchema,
} from '../validators/auth.validator';
import { authRequire } from '../middlewares/auth-require';

const authRoutes = Router();

authRoutes.post('/signup', validate(signupSchema), signup);
authRoutes.post('/signin', validate(signinSchema), signin);
authRoutes.post('/resend-verification-token', resendVerificationToken);
authRoutes.post('/verify-email', validate(verifyEmailSchema), verifyEmail);
authRoutes.post('/signout', authRequire, signout);

export default authRoutes;
