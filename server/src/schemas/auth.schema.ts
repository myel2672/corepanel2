import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir email girin'),
  password: z.string().min(1, 'Şifre gerekli'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir email girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre gerekli'),
  newPassword: z.string().min(6, 'Yeni şifre en az 6 karakter olmalı'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Geçerli bir email girin'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token gerekli'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
});
