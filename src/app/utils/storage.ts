import { User, CartItem, Order } from "../types";

export const storage = {
  // User management
  getUser: (): User | null => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  setUser: (user: User) => {
    localStorage.setItem("user", JSON.stringify(user));
  },

  updateUserPoints: (points: number) => {
    const user = storage.getUser();
    if (user) {
      user.points = points;
      localStorage.setItem("user", JSON.stringify(user));
    }
  },

  clearUser: () => {
    localStorage.removeItem("user");
  },

  // Cart management
  getCart: (): CartItem[] => {
    const cart = localStorage.getItem("cart");
    return cart ? JSON.parse(cart) : [];
  },

  setCart: (cart: CartItem[]) => {
    localStorage.setItem("cart", JSON.stringify(cart));
  },

  clearCart: () => {
    localStorage.removeItem("cart");
  },

  // Order management
  getOrders: (): Order[] => {
    const orders = localStorage.getItem("orders");
    return orders ? JSON.parse(orders) : [];
  },

  addOrder: (order: Order) => {
    const orders = storage.getOrders();
    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));
  },

  updateOrder: (orderId: string, updates: Partial<Order>) => {
    const orders = storage.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates };
      localStorage.setItem("orders", JSON.stringify(orders));
    }
  },

  getOrder: (orderId: string): Order | null => {
    const orders = storage.getOrders();
    return orders.find((o) => o.id === orderId) || null;
  },
};