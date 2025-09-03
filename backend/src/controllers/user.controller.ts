import { Request, Response } from 'express';
import { AppError } from '../utils/app-error';
import { StatusCode } from '../config/status-code';
import { prisma } from '../config/db';

// healper function
export function getUserId(req: Request): string {
  const userId = req.userId;
  if (!userId) {
    throw new AppError('Unauthroize user', StatusCode.UNAUTHORIZED);
  }
  return userId;
}

export async function getProfile(req: Request, res: Response) {
  const userId = getUserId(req);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, date_of_birth: true },
  });
  if (!user) {
    throw new AppError('User not found', StatusCode.UNAUTHORIZED);
  }

  res
    .status(StatusCode.OK)
    .json({ message: 'Profile fetched successfully', user });
}
