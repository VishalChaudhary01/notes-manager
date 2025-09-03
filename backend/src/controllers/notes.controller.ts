import { Request, Response } from 'express';
import { AddNoteType } from '../validators/notes.validator';
import { prisma } from '../config/db';
import { AppError } from '../utils/app-error';
import { StatusCode } from '../config/status-code';
import { getUserId } from './user.controller';

export async function addNote(req: Request, res: Response) {
  const { title, content }: AddNoteType = req.body;
  const userId = getUserId(req);

  const existNote = await prisma.note.findFirst({
    where: { title, user_id: userId },
  });
  if (existNote) {
    throw new AppError(
      'Note with given title is already present',
      StatusCode.BAD_REQUEST
    );
  }

  await prisma.note.create({
    data: {
      title,
      content,
      user_id: userId,
    },
  });

  res.status(StatusCode.CREATED).json({ message: 'Note added successfully' });
}

export async function getAllNotes(req: Request, res: Response) {
  const userId = getUserId(req);

  const notes = await prisma.note.findMany({ where: { user_id: userId } });

  res
    .status(StatusCode.OK)
    .json({ message: 'All notes fetched successfully', notes });
}

export async function getNote(req: Request, res: Response) {
  const noteId = req.params.id;
  const userId = getUserId(req);

  const note = await prisma.note.findFirst({
    where: { id: noteId, user_id: userId },
  });
  if (!note) {
    throw new AppError('Note not found', StatusCode.NOT_FOUND);
  }

  res
    .status(StatusCode.OK)
    .json({ message: 'Note fetched successfully', note });
}

export async function deleteNote(req: Request, res: Response) {
  const noteId = req.params.id;
  const userId = getUserId(req);

  const note = await prisma.note.findFirst({
    where: { id: noteId, user_id: userId },
  });
  if (!note) {
    throw new AppError('Note not found', StatusCode.NOT_FOUND);
  }

  await prisma.note.delete({ where: { id: noteId } });

  res.status(StatusCode.OK).json({ message: 'Note deleted successfully' });
}
