import type {
  SigninType,
  SignupType,
  VerifyEmailType,
} from '@/validators/auth.validator';
import { axios } from './axios-client';
import type { AddNoteType } from '@/validators/notes.validator';

// AUTHENTICATION APIs
export async function signup(input: SignupType) {
  const response = await axios.post('/auth/signup', input);
  return response.data;
}

export async function signin(input: SigninType) {
  const response = await axios.post('/auth/signin', input);
  return response.data;
}

export async function signout() {
  const response = await axios.post('/auth/signout');
  return response.data;
}

export async function verifyEmail(input: VerifyEmailType) {
  const response = await axios.post('/auth/verify-email', input);
  return response.data;
}

export async function resendVerificationToken() {
  const response = await axios.post('/auth/resend-verification-token');
  return response.data;
}

export async function googleAuth() {
  return await axios.get('//auth/google');
}

// USER APIs
export async function getProfile() {
  const responsee = await axios.get('/user/profile');
  return responsee.data;
}

// NOTES APIs
export async function getAllNotes() {
  const responsee = await axios.get('/notes');
  return responsee.data;
}

export async function getNote() {
  const responsee = await axios.get('/notes/:id');
  return responsee.data;
}

export async function addNote(input: AddNoteType) {
  const responsee = await axios.post('/notes', input);
  return responsee.data;
}

export async function deleteNote(id: string) {
  const responsee = await axios.delete(`/notes/${id}`);
  return responsee.data;
}
