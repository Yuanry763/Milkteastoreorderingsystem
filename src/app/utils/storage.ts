import { User, CartItem, Order, Feedback } from "../types";

// Validate if a CartItem is valid (must have either drink or snack)
export const isValidCartItem = (item: CartItem): boolean => {
  return (!!item.drink || !!item.snack) && item.quantity > 0 && item.totalPrice > 0;
};

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
    const items = cart ? JSON.parse(cart) : [];
    // Filter out invalid items to prevent data corruption
    return items.filter(isValidCartItem);
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

  // Feedback management
  addFeedback: (feedback: Feedback) => {
    const user = storage.getUser();
    if (user) {
      if (!user.feedbacks) {
        user.feedbacks = [];
      }
      user.feedbacks.push(feedback);
      storage.setUser(user);
    }
  },

  getFeedbacks: (): Feedback[] => {
    const user = storage.getUser();
    return user?.feedbacks || [];
  },

  updateFeedback: (feedbackId: string, reply: string) => {
    const user = storage.getUser();
    if (user && user.feedbacks) {
      const feedback = user.feedbacks.find(f => f.id === feedbackId);
      if (feedback) {
        feedback.status = "replied";
        feedback.reply = reply;
        feedback.repliedAt = new Date().toISOString();
        storage.setUser(user);
      }
    }
  },
};