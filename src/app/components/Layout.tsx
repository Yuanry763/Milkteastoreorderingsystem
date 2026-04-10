import { Outlet, useNavigate, useLocation } from "react-router";
import { ShoppingCart, User, LogOut, Gift, UserCircle } from "lucide-react";
import { Button } from "./ui/button";
import { storage } from "../utils/storage";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(storage.getUser());
  const [cartCount, setCartCount] = useState(0);

  // Monitor user state and route changes
  useEffect(() => {
    const currentUser = storage.getUser();
    setUser(currentUser);
  }, [location.pathname]);

  useEffect(() => {
    const updateCart = () => {
      const cart = storage.getCart();
      const count = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    };

    updateCart();
    // Poll for cart updates
    const interval = setInterval(updateCart, 500);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    storage.clearUser();
    storage.clearCart();
    setUser(null);
    navigate("/");
  };

  const isLoginPage = location.pathname === "/";

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {!isLoginPage && user && (
        <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">🧋</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Bubble Tea
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/menu")}
              >
                Menu
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate("/cart")}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-orange-600">
                    {cartCount}
                  </Badge>
                )}
              </Button>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg">
                <Gift className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-700">{user.points} pts</span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/profile")}
              >
                <UserCircle className="w-5 h-5" />
              </Button>

              <span className="text-sm font-medium">{user.name}</span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>
      )}

      <main className="min-h-[calc(100vh-73px)]">
        <Outlet />
      </main>
    </div>
  );
}