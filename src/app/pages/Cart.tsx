import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { storage } from "../utils/storage";
import { CartItem } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { Checkbox } from "../components/ui/checkbox";
import { Trash2, ShoppingBag, Minus, Plus, Edit } from "lucide-react";
import { toast } from "sonner";
import { DrinkCustomizer } from "../components/DrinkCustomizer";

export function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const items = storage.getCart();
    setCartItems(items);
    // Initially select all items
    setSelectedItems(new Set(items.map(item => item.id)));
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(item => item.id)));
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map((item) => {
      if (item.id === itemId) {
        // Calculate unit price properly based on item type
        let unitPrice: number;
        if (item.drink && item.customization) {
          // For drinks, recalculate based on original price with all toppings
          const basePrice = item.drink.basePrice;
          const sizeMultiplier = item.customization.size === "small" ? 1 : 
                                 item.customization.size === "medium" ? 1.2 : 1.4;
          const toppingPrice = item.customization.toppings.reduce((sum, t) => sum + t.price, 0);
          unitPrice = basePrice * sizeMultiplier + toppingPrice;
        } else if (item.snack) {
          // For snacks, use the item's price directly
          unitPrice = item.snack.price;
        } else {
          // Fallback: divide original totalPrice by original quantity
          unitPrice = item.totalPrice / item.quantity;
        }
        
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: Math.round(unitPrice * newQuantity * 100) / 100, // Round to 2 decimals
        };
      }
      return item;
    });
    
    storage.setCart(updatedCart);
    setCartItems(updatedCart);
  };

  const removeItem = (itemId: string) => {
    const updatedCart = cartItems.filter((item) => item.id !== itemId);
    storage.setCart(updatedCart);
    setCartItems(updatedCart);
    
    // Remove from selection
    const newSelection = new Set(selectedItems);
    newSelection.delete(itemId);
    setSelectedItems(newSelection);
    
    toast.success("Item removed from cart");
  };

  const handleModifyItem = (item: CartItem) => {
    setEditingItem(item);
  };

  const handleCloseModify = () => {
    setEditingItem(null);
    loadCart();
  };

  const clearCart = () => {
    storage.clearCart();
    setCartItems([]);
    setSelectedItems(new Set());
    toast.success("Cart cleared");
  };

  const getTotalPrice = () => {
    return cartItems
      .filter(item => selectedItems.has(item.id))
      .reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const getSelectedCount = () => {
    return cartItems
      .filter(item => selectedItems.has(item.id))
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      toast.error("Please select items to checkout");
      return;
    }
    
    // Store selected items for checkout
    const itemsToCheckout = cartItems.filter(item => selectedItems.has(item.id));
    sessionStorage.setItem('checkoutItems', JSON.stringify(itemsToCheckout));
    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some delicious drinks to get started!</p>
          <Button
            onClick={() => navigate("/menu")}
            className="bg-gradient-to-r from-amber-500 to-orange-600"
          >
            Browse Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Shopping Cart
          </h1>
          <Button variant="outline" onClick={clearCart} size="sm">
            Clear Cart
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Select All */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Select All Items ({cartItems.length})
                  </label>
                </div>
              </CardContent>
            </Card>

            {cartItems.map((item) => (
              <Card key={item.id} className={selectedItems.has(item.id) ? "border-amber-500 border-2" : ""}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="flex items-start pt-2">
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={() => toggleItemSelection(item.id)}
                      />
                    </div>
                    
                    <img
                      src={item.drink?.image || item.snack?.image}
                      alt={item.drink?.name || item.snack?.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{item.drink?.name || item.snack?.name}</h3>
                          {item.drink && item.customization && (
                            <>
                              <p className="text-sm text-gray-600">
                                {item.customization.size.charAt(0).toUpperCase() + item.customization.size.slice(1)} • 
                                {item.customization.sugarLevel}% Sugar • 
                                {item.customization.iceLevel}% Ice
                              </p>
                              {item.customization.toppings?.length > 0 && (
                                <p className="text-sm text-gray-600">
                                  + {item.customization.toppings.map((t) => t.name).join(", ")}
                                </p>
                              )}
                            </>
                          )}
                          {item.snack && (
                            <p className="text-sm text-gray-600">{item.snack.category}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {item.drink && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3"
                                onClick={() => handleModifyItem(item)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Modify
                              </Button>
                              <Separator orientation="vertical" className="h-6" />
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="font-bold text-lg">
                          HK${item.totalPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Selected Items</span>
                    <span>{getSelectedCount()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>HK${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      HK${getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600"
                  onClick={handleCheckout}
                  disabled={selectedItems.size === 0}
                >
                  Proceed to Pay ({selectedItems.size})
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/menu")}
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {editingItem && editingItem.drink && (
        <DrinkCustomizer
          drink={editingItem.drink}
          open={!!editingItem}
          onClose={handleCloseModify}
          existingItem={editingItem}
        />
      )}
    </div>
  );
}