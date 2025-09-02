import { z } from 'zod';

// Name schema
export const nameSchema = z
  .string('Name is required')
  .trim()
  .min(2, { message: 'Name must be at least 2 characters' })
  .max(100, { message: 'Name must be under 100 characters' });

// Email schema
export const emailSchema = z
  .string('Email is required')
  .trim()
  .min(1, { message: 'Email cannot be empty' })
  .email('Please enter a valid email address');

// Date-of-Birth Schema
export const dobSchema = z
  .string('DateOfBirth is required')
  .trim()
  .refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Date of birth must be a valid date string (e.g., YYYY-MM-DD)',
  });

// OTP code Schema
export const codeSchema = z
  .string('Code is required')
  .trim()
  .regex(/^\d{6}$/, 'Code must be a 6-digit number');
