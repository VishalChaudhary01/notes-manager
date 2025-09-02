import z from 'zod';
import { dobSchema, emailSchema, nameSchema, codeSchema } from '.';

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  dob: dobSchema,
});

export const signinSchema = z.object({
  email: emailSchema,
});

export const verifyEmailSchema = z.object({
  code: codeSchema,
});

export type SignupType = z.infer<typeof signupSchema>;
export type SigninType = z.infer<typeof signinSchema>;
export type VerifyEmailType = z.infer<typeof verifyEmailSchema>;
