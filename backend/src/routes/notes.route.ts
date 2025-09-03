import { Router } from 'express';
import {
  addNote,
  deleteNote,
  getAllNotes,
  getNote,
} from '../controllers/notes.controller';
import { validate } from '../middlewares/validate';
import { addNoteSchema } from '../validators/notes.validator';

const noteRoutes = Router();

noteRoutes.post('/', validate(addNoteSchema), addNote);
noteRoutes.get('/', getAllNotes);
noteRoutes.get('/:id', getNote);
noteRoutes.delete('/:id', deleteNote);

export default noteRoutes;
