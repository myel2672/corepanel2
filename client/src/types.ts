export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  businessId?: string; // ADMIN ve STAFF için zorunlu
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
  product?: { id: string; name: string }; // İlişkisel veri için
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
  businessId?: string; // Hangi işletmeye ait
}

export interface Order {
  id: string;
  status: string;
  customer: string;
  total: number;
  createdAt: string;
  businessId?: string; // Hangi işletmeye ait
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: Product;
}
