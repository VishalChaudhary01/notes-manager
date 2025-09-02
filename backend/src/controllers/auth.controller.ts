import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { StatusCode } from '../config/status-code';
import { AppError } from '../utils/app-error';
import {
  SigninType,
  SignupType,
  VerifyEmailType,
} from '../validators/auth.validator';
import { VerificationType } from '@prisma/client';
import { env } from '../config/env';

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

    const code = crypto.randomInt(100000, 999999).toString();
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

  const verificationToken = jwt.sign(
    { userId, type: 'EMAIL_CONFIRM' },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  res
    .cookie(env.VERIFICATION_COOKIE, verificationToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000,
      sameSite: 'lax',
      path: '/',
    })
    .status(StatusCode.CREATED)
    .json({ message: 'User registered successfully, Verify your email' });
}

export async function resendVerificationToken(req: Request, res: Response) {
  const decoded = jwt.verify(
    req.cookies[env.VERIFICATION_COOKIE],
    env.JWT_SECRET
  ) as { userId: string; type?: VerificationType };

  const { userId, type } = decoded;
  if (!userId || !type) {
    throw new AppError(
      'Invalid or expired verification session',
      StatusCode.BAD_REQUEST
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.verificationToken.deleteMany({ where: { user_id: userId, type } });

    const code = crypto.randomInt(100000, 999999).toString();

    await tx.verificationToken.create({
      data: {
        code,
        user_id: userId,
        type,
        expires_at: new Date(Date.now() + 1000 * 60 * 15),
      },
    });
  });

  res.status(StatusCode.OK).json({ message: 'Verification code resend' });
}

export async function verifyEmail(req: Request, res: Response) {
  const { code }: VerifyEmailType = req.body;

  let decoded;
  try {
    decoded = jwt.verify(
      req.cookies[env.VERIFICATION_COOKIE],
      env.JWT_SECRET
    ) as { userId: string; type?: VerificationType };
  } catch {
    throw new AppError(
      'Invalid or expired verification session',
      StatusCode.BAD_REQUEST
    );
  }

  const { userId, type } = decoded;
  if (!userId || !type) {
    throw new AppError(
      'Invalid or expired verification session',
      StatusCode.BAD_REQUEST
    );
  }

  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      code,
      user_id: userId,
      type,
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

  const token = jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '1d' });

  res
    .clearCookie(env.VERIFICATION_COOKIE)
    .cookie(env.AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      path: '/',
    })
    .status(StatusCode.OK)
    .json({
      message: 'Email verified successfully',
    });
}

export async function signin(req: Request, res: Response) {
  const { email }: SigninType = req.body;

  const user = await prisma.user.findFirst({
    where: { email, email_verified: true },
  });
  if (!user) {
    throw new AppError('User not found', StatusCode.NOT_FOUND);
  }

  await prisma.verificationToken.deleteMany({
    where: { user_id: user.id, type: 'SIGNIN' },
  });

  const code = crypto.randomInt(100000, 999999).toString();

  await prisma.verificationToken.create({
    data: {
      user_id: user.id,
      type: 'SIGNIN',
      code: code.toString(),
      expires_at: new Date(Date.now() + 1000 * 60 * 15),
    },
  });

  const verificationToken = jwt.sign(
    { userId: user.id, type: 'SIGNIN' },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  res
    .cookie(env.VERIFICATION_COOKIE, verificationToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production' ? true : false,
      maxAge: 15 * 60 * 1000,
      sameSite: 'lax',
      path: '/',
    })
    .status(StatusCode.OK)
    .json({ message: 'Verify you email' });
}

export async function signout(_req: Request, res: Response) {
  res
    .clearCookie(env.AUTH_COOKIE_NAME)
    .status(StatusCode.OK)
    .json({ message: 'Logout Successfully' });
}
