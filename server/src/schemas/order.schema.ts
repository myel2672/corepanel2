import { z } from 'zod';

export const createOrderSchema = z.object({
  productId: z.number().int().positive('Geçerli ürün ID gerekli'),
  quantity: z.number().int().positive('Miktar pozitif olmalı'),
  customerId: z.number().int().positive().optional().nullable(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED']),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Ürün adı gerekli'),
  price: z.number().positive('Fiyat pozitif olmalı'),
  costPrice: z.number().nonnegative().optional().nullable(),
  stock: z.number().int().nonnegative('Stok negatif olamaz'),
  description: z.string().optional().nullable(),
});

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Müşteri adı gerekli'),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
});

export const createSaleSchema = z.object({
  productId: z.number().int().optional().nullable(),
  quantity: z.number().positive('Adet pozitif olmalı'),
  unitPrice: z.number().positive('Fiyat pozitif olmalı'),
  unitCost: z.number().nonnegative().optional().nullable(),
  description: z.string().optional().nullable(),
});
