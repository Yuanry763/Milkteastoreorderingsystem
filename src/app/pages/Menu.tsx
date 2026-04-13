import { useState } from "react";
import { useNavigate } from "react-router";
import { drinks, snacks } from "../data/menu";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { DrinkCustomizer } from "../components/DrinkCustomizer";
import { Drink, Snack } from "../types";
import { ShoppingCart, Plus } from "lucide-react";
import { storage } from "../utils/storage";
import { toast } from "sonner";

export function Menu() {
  const navigate = useNavigate();
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [filter, setFilter] = useState<string>("All");
  const [cartCount, setCartCount] = useState(0);

  const allCategories = ["All", ...Array.from(new Set([...drinks, ...snacks].map((item) => item.category)))];
  const filteredItems = filter === "All" 
    ? [...drinks, ...snacks]
    : [...drinks, ...snacks].filter((item) => item.category === filter);
  
  const filteredDrinks = filteredItems.filter(item => 'basePrice' in item) as Drink[];
  const filteredSnacks = filteredItems.filter(item => 'price' in item && !('basePrice' in item)) as Snack[];

  const sortedDrinks = [...filteredDrinks].sort((a, b) => {
    if (a.isRecommended === b.isRecommended) return 0;
    return a.isRecommended ? -1 : 1;
  });

  const sortedSnacks = [...filteredSnacks].sort((a, b) => {
    if (a.isRecommended === b.isRecommended) return 0;
    return a.isRecommended ? -1 : 1;
  });

  const updateCartCount = () => {
    const cart = storage.getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(count);
  };

  const handleDrinkSelect = (drink: Drink) => {
    setSelectedDrink(drink);
  };

  const handleAddSnack = (snack: Snack) => {
    const cart = storage.getCart();
    // Find existing snack by product ID and item type (snack without customization)
    const existingItem = cart.find((item) => 
      item.snack?.id === snack.id && !item.drink && !item.customization
    );
    
    if (existingItem && existingItem.snack) {
      // Update quantity and price
      existingItem.quantity += 1;
      existingItem.totalPrice = Math.round(existingItem.snack.price * existingItem.quantity * 100) / 100;
    } else {
      // Create new snack item - ensure all required fields are set
      const newItem = {
        id: `snack-${snack.id}-${Date.now()}`,
        snack: snack,
        quantity: 1,
        totalPrice: Math.round(snack.price * 100) / 100, // Ensure proper decimal format
      } as Partial<typeof CartItem>;
      cart.push(newItem as any);
    }
    
    storage.setCart(cart);
    updateCartCount();
    toast.success(`${snack.name} added to cart!`);
  };

  const handleCloseCustomizer = () => {
    setSelectedDrink(null);
    updateCartCount();
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          Our Menu
        </h1>
        <p className="text-gray-600 mb-6">Choose your favorite bubble tea and snacks and customize to your taste</p>
        
        <div className="flex flex-wrap gap-2">
          {allCategories.map((category) => (
            <Button
              key={category}
              variant={filter === category ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(category)}
              className={filter === category ? "bg-gradient-to-r from-amber-500 to-orange-600" : ""}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Drinks Section */}
      {sortedDrinks.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Beverages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedDrinks.map((drink) => (
              <Card key={drink.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
                {drink.isRecommended && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-red-500 text-white">Recommend</Badge>
                  </div>
                )}
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={drink.image}
                    alt={drink.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{drink.name}</CardTitle>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      HK${drink.basePrice.toFixed(0)}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{drink.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600"
                    onClick={() => handleDrinkSelect(drink)}
                  >
                    Customize & Add
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Snacks Section */}
      {sortedSnacks.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Snacks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedSnacks.map((snack) => (
              <Card key={snack.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
                {snack.isRecommended && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-red-500 text-white">Recommend</Badge>
                  </div>
                )}
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={snack.image}
                    alt={snack.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{snack.name}</CardTitle>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      HK${snack.price.toFixed(0)}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{snack.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600"
                    onClick={() => handleAddSnack(snack)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Fixed View Cart Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40">
        <div className="container mx-auto max-w-7xl">
          <Button
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 h-12 text-lg"
            onClick={() => navigate("/cart")}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            View Cart {cartCount > 0 && `(${cartCount} items)`}
          </Button>
        </div>
      </div>

      {selectedDrink && (
        <DrinkCustomizer
          drink={selectedDrink}
          open={!!selectedDrink}
          onClose={handleCloseCustomizer}
        />
      )}
    </div>
  );
}