import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid('Geçerli ürün ID gerekli'),
        quantity: z.number().int().positive('Miktar pozitif olmalı'),
      })
    )
    .min(1, 'En az 1 ürün gerekli'),
});