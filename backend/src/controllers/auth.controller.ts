import { Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import {
  SigninType,
  SignupType,
  VerifyEmailType,
} from '../validators/auth.validator';
import { VerificationType } from '@prisma/client';
import { env } from '../config/env';
import { prisma } from '../config/db';
import { StatusCode } from '../config/status-code';
import { AppError } from '../utils/app-error';
import { decodeJWT, signJWT, verifyJWT } from '../utils/jwt';
import { generateCode } from '../utils/generate-code';
import { clearCookie, getCookie, setCookie } from '../utils/cookie';
import queryString from 'query-string';
import axios from 'axios';

export async function signup(req: Request, res: Response) {
  const { name, email, dob }: SignupType = req.body;

  const userExist = await prisma.user.findUnique({ where: { email } });

  const { userId } = await prisma.$transaction(async (tx) => {
    let userId: string;

    if (userExist) {
      if (userExist.email_verified) {
        throw new AppError('User already registered', StatusCode.BAD_REQUEST);
      }

      const updatedUser = await tx.user.update({
        where: { id: userExist.id },
        data: { name, date_of_birth: new Date(dob) },
      });

      userId = updatedUser.id;
    } else {
      const newUser = await tx.user.create({
        data: { name, email, date_of_birth: new Date(dob) },
      });

      userId = newUser.id;
    }

    await tx.verificationToken.deleteMany({
      where: { user_id: userId, type: VerificationType.EMAIL_CONFIRM },
    });

    const code = generateCode();

    await tx.verificationToken.create({
      data: {
        user_id: userId,
        type: 'EMAIL_CONFIRM',
        code,
        expires_at: new Date(Date.now() + 1000 * 60 * 15),
      },
    });

    return { userId };
  });

  const verificationToken = signJWT(userId, 'EMAIL_CONFIRM', '15m');

  setCookie(res, verificationToken, env.VERIFICATION_COOKIE_NAME, 15 * 60);

  res
    .status(StatusCode.CREATED)
    .json({ message: 'User registered successfully, Verify your email' });
}

export async function resendVerificationToken(req: Request, res: Response) {
  try {
    const token = getCookie(req, env.VERIFICATION_COOKIE_NAME);

    const { userId, type } = verifyJWT(token);

    const existingToken = await prisma.verificationToken.findFirst({
      where: {
        user_id: userId,
        type: type as VerificationType,
        expires_at: { gt: new Date() },
      },
    });

    if (!existingToken) {
      throw new AppError(
        'Invalid or expired verification session',
        StatusCode.BAD_REQUEST
      );
    }

    const tokenAge = Date.now() - (existingToken.created_at?.getTime() || 0);
    if (tokenAge < 60 * 1000) {
      throw new AppError(
        'Please wait before requesting a new code',
        StatusCode.TOO_MANY_REQUESTS
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError(
        'Invalid or expired verification session',
        StatusCode.BAD_REQUEST
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.verificationToken.deleteMany({
        where: { user_id: userId, type: type as VerificationType },
      });

      const code = generateCode();
      await tx.verificationToken.create({
        data: {
          code,
          user_id: userId,
          type: type as VerificationType,
          expires_at: new Date(Date.now() + 1000 * 60 * 15),
        },
      });
    });

    res.status(StatusCode.OK).json({ message: 'Verification code resend' });
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new AppError(
        'Invalid or expired verification session',
        StatusCode.BAD_REQUEST
      );
    }
    throw error;
  }
}

export async function verifyEmail(req: Request, res: Response) {
  const { code }: VerifyEmailType = req.body;
  try {
    const token = getCookie(req, env.VERIFICATION_COOKIE_NAME);
    const { userId, type } = verifyJWT(token);

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        code,
        user_id: userId,
        type: type as VerificationType,
        expires_at: { gt: new Date() },
      },
    });
    if (!verificationToken) {
      throw new AppError(
        'Invalid or expired verification session',
        StatusCode.BAD_REQUEST
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { email_verified: true },
      });

      await tx.verificationToken.delete({
        where: { id: verificationToken.id },
      });
    });

    const authToken = signJWT(userId, 'AUTH_TOKEN', '1d');
    setCookie(res, authToken, env.AUTH_COOKIE_NAME, 24 * 60 * 60);

    clearCookie(res, [env.VERIFICATION_COOKIE_NAME]);

    res.status(StatusCode.OK).json({
      message: 'Email verified successfully',
    });
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new AppError(
        'Invalid or expired verification session',
        StatusCode.BAD_REQUEST
      );
    }
    throw error;
  }
}

export async function signin(req: Request, res: Response) {
  const { email }: SigninType = req.body;

  const user = await prisma.user.findFirst({
    where: { email, email_verified: true },
  });
  if (!user) {
    throw new AppError('User not found', StatusCode.NOT_FOUND);
  }

  const existingToken = await prisma.verificationToken.findFirst({
    where: {
      user_id: user.id,
      type: 'SIGNIN',
      expires_at: { gt: new Date() },
    },
  });

  if (existingToken) {
    const tokenAge = Date.now() - (existingToken.created_at?.getTime() || 0);
    if (tokenAge < 60 * 1000) {
      throw new AppError(
        'Please wait before requesting a new code',
        StatusCode.TOO_MANY_REQUESTS
      );
    }
  }

  await prisma.verificationToken.deleteMany({
    where: { user_id: user.id, type: 'SIGNIN' },
  });

  const code = generateCode();

  await prisma.verificationToken.create({
    data: {
      user_id: user.id,
      type: 'SIGNIN',
      code: code,
      expires_at: new Date(Date.now() + 1000 * 60 * 15),
    },
  });

  const verificationToken = signJWT(user.id, 'SIGNIN', '15m');
  setCookie(res, verificationToken, env.VERIFICATION_COOKIE_NAME, 15 * 60);

  res.status(StatusCode.OK).json({ message: 'Verify you email' });
}

export async function signout(_req: Request, res: Response) {
  clearCookie(res, [env.VERIFICATION_COOKIE_NAME, env.AUTH_COOKIE_NAME]);
  res.status(StatusCode.OK).json({ message: 'Logout Successfully' });
}

export async function googleAuth(_req: Request, res: Response) {
  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(env.GOOGLE_REDIRECT_URI)}&` +
    `scope=${encodeURIComponent('profile email')}&` +
    `response_type=code&` +
    `access_type=offline`;

  res.redirect(googleAuthUrl);
}

export async function googleCallback(req: Request, res: Response) {
  const { code } = req.query;
  if (!code) {
    res.redirect(`${env.FRONTEND_URL}/signin?error=oauth_error`);
  }

  try {
    const tokenRes = await axios.post(
      'https://oauth2.googleapis.com/token',
      queryString.stringify({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { id_token } = tokenRes.data;

    const { email, name, sub } = decodeJWT(id_token);

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          provider: 'GOOGLE',
          providerId: sub,
          email_verified: true,
        },
      });
    }

    const token = signJWT(user.id, 'AUTH_TOKEN', '1d');
    setCookie(res, token, env.AUTH_COOKIE_NAME, 24 * 60 * 60);

    res.redirect(`${env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new AppError('Invalid or expired token', StatusCode.UNAUTHORIZED);
    }
    throw error;
  }
}
