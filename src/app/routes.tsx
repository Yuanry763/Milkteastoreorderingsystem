import { createBrowserRouter } from "react-router";
import { Login } from "./pages/Login";
import { Menu } from "./pages/Menu";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { OrderStatus } from "./pages/OrderStatus";
import { Profile } from "./pages/Profile";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Login },
      { path: "menu", Component: Menu },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "order/:orderId", Component: OrderStatus },
      { path: "profile", Component: Profile },
    ],
  },
]);