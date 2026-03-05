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

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  costPrice?: number;
}

export interface Order {
  id: string;
  status: string;
  customer: string;  // ← bu satırı ekle
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
 
  
