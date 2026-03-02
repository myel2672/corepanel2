export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
}

export interface Order {
  id: string;
  status: string;
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