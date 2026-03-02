export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  businessId?: string;
}

export interface Business {
  id: string;
  name: string;
  sector: string;
  isApproved: boolean;
}

export interface Sale {
  id: string;
  businessId: string;
  productId?: string;
  description?: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  unitCost?: number;
  total: number;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  costPrice?: number;
  stock: number;
  description?: string;
}

export interface Order {
  id: string;
  status: string;
  customer: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: Product;
}