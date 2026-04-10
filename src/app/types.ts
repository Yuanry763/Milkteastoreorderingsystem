export interface User {
  id: string;
  email: string;
  name: string;
  points: number;
}

export interface DrinkTopping {
  id: string;
  name: string;
  price: number;
}

export interface DrinkCustomization {
  size: "small" | "medium" | "large";
  sugarLevel: number; // 0-100
  iceLevel: number; // 0-100
  toppings: DrinkTopping[];
}

export interface Drink {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  image: string;
}

export interface CartItem {
  id: string;
  drink: Drink;
  customization: DrinkCustomization;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: "pending" | "preparing" | "ready" | "completed";
  queueNumber: number;
  createdAt: string;
  estimatedTime: number; // in minutes
}