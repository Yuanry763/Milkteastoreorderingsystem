import { useState } from "react";
import { useNavigate } from "react-router";
import { drinks } from "../data/menu";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { DrinkCustomizer } from "../components/DrinkCustomizer";
import { Drink } from "../types";
import { ShoppingCart } from "lucide-react";
import { storage } from "../utils/storage";

export function Menu() {
  const navigate = useNavigate();
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [filter, setFilter] = useState<string>("All");
  const [cartCount, setCartCount] = useState(0);

  const categories = ["All", ...Array.from(new Set(drinks.map((d) => d.category)))];
  const filteredDrinks = filter === "All" ? drinks : drinks.filter((d) => d.category === filter);

  const updateCartCount = () => {
    const cart = storage.getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(count);
  };

  const handleDrinkSelect = (drink: Drink) => {
    setSelectedDrink(drink);
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
        <p className="text-gray-600 mb-6">Choose your favorite bubble tea and customize it to your taste</p>
        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDrinks.map((drink) => (
          <Card key={drink.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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