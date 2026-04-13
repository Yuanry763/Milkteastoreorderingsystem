import { useState } from "react";
import { Drink, DrinkCustomization, CartItem } from "../types";
import { toppings, sizeMultipliers } from "../data/menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import { Slider } from "./ui/slider";
import { storage } from "../utils/storage";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { useEffect } from "react";

interface DrinkCustomizerProps {
  drink: Drink;
  open: boolean;
  onClose: () => void;
  existingItem?: CartItem;
}

export function DrinkCustomizer({ drink, open, onClose, existingItem }: DrinkCustomizerProps) {
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState<DrinkCustomization>({
    size: "medium",
    sugarLevel: 100,
    iceLevel: 100,
    toppings: [],
  });

  useEffect(() => {
    if (existingItem) {
      setQuantity(existingItem.quantity);
      setCustomization(existingItem.customization);
    } else {
      setQuantity(1);
      setCustomization({
        size: "medium",
        sugarLevel: 100,
        iceLevel: 100,
        toppings: [],
      });
    }
  }, [existingItem, open]);

  const calculatePrice = () => {
    const sizeMultiplier = sizeMultipliers[customization.size];
    const basePrice = drink.basePrice * sizeMultiplier;
    const toppingsPrice = customization.toppings.reduce((sum, t) => sum + t.price, 0);
    const totalPrice = (basePrice + toppingsPrice) * quantity;
    // Round to 2 decimal places to avoid floating point precision issues
    return Math.round(totalPrice * 100) / 100;
  };

  const handleAddToCart = () => {
    const finalPrice = calculatePrice();
    
    if (existingItem) {
      // Update existing item
      const currentCart = storage.getCart();
      const updatedCart = currentCart.map((item) =>
        item.id === existingItem.id
          ? {
              ...item,
              customization,
              quantity,
              totalPrice: finalPrice,
            }
          : item
      );
      storage.setCart(updatedCart);
      toast.success(`Updated ${drink.name}!`);
    } else {
      // Add new item
      const cartItem: CartItem = {
        id: `${drink.id}-${Date.now()}`,
        drink,
        customization,
        quantity,
        totalPrice: finalPrice,
      };

      const currentCart = storage.getCart();
      storage.setCart([...currentCart, cartItem]);
      toast.success(`Added ${quantity}x ${drink.name} to cart!`);
    }
    
    onClose();
  };

  const toggleTopping = (topping: typeof toppings[0]) => {
    const exists = customization.toppings.find((t) => t.id === topping.id);
    if (exists) {
      setCustomization({
        ...customization,
        toppings: customization.toppings.filter((t) => t.id !== topping.id),
      });
    } else {
      setCustomization({
        ...customization,
        toppings: [...customization.toppings, topping],
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{drink.name}</DialogTitle>
          <DialogDescription>{drink.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Size Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Size</Label>
            <RadioGroup
              value={customization.size}
              onValueChange={(value) => setCustomization({ ...customization, size: value as any })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="small" />
                <Label htmlFor="small" className="cursor-pointer">
                  Small (+HK$0)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="cursor-pointer">
                  Medium (+HK${((drink.basePrice * sizeMultipliers.medium) - drink.basePrice).toFixed(0)})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="large" />
                <Label htmlFor="large" className="cursor-pointer">
                  Large (+HK${((drink.basePrice * sizeMultipliers.large) - drink.basePrice).toFixed(0)})
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Sugar Level */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-base font-semibold">Sugar Level</Label>
              <span className="text-sm text-gray-600">{customization.sugarLevel}%</span>
            </div>
            <Slider
              value={[customization.sugarLevel]}
              onValueChange={([value]) => setCustomization({ ...customization, sugarLevel: value })}
              max={100}
              step={25}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Ice Level */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-base font-semibold">Ice Level</Label>
              <span className="text-sm text-gray-600">{customization.iceLevel}%</span>
            </div>
            <Slider
              value={[customization.iceLevel]}
              onValueChange={([value]) => setCustomization({ ...customization, iceLevel: value })}
              max={100}
              step={25}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Toppings */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Add Toppings</Label>
            <div className="grid grid-cols-2 gap-3">
              {toppings.map((topping) => {
                const isSelected = customization.toppings.find((t) => t.id === topping.id);
                return (
                  <div
                    key={topping.id}
                    className="flex items-center space-x-2 p-3 rounded-lg border cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleTopping(topping)}
                  >
                    <Checkbox
                      id={topping.id}
                      checked={!!isSelected}
                      onCheckedChange={() => toggleTopping(topping)}
                    />
                    <Label htmlFor={topping.id} className="flex-1 cursor-pointer">
                      <div>{topping.name}</div>
                      <div className="text-xs text-gray-500">+HK${topping.price.toFixed(0)}</div>
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Quantity</Label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              HK${calculatePrice().toFixed(2)}
            </div>
            <Button
              onClick={handleAddToCart}
              className="bg-gradient-to-r from-amber-500 to-orange-600"
            >
              {existingItem ? "Update Cart" : "Add to Cart"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}