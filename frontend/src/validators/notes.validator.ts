import z from 'zod';
import { contentSchema, titleSchema } from '.';

export const addNoteSchema = z.object({
  title: titleSchema,
  content: contentSchema,
});

export type AddNoteType = z.infer<typeof addNoteSchema>;
