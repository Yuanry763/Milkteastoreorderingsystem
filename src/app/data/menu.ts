import { Drink, DrinkTopping } from "../types";

export const drinks: Drink[] = [
  {
    id: "1",
    name: "Classic Milk Tea",
    description: "Traditional black tea with fresh milk",
    basePrice: 28,
    category: "Milk Tea",
    image: "https://images.unsplash.com/photo-1572932759882-bb34c848d1b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWJibGUlMjB0ZWElMjBtaWxrJTIwdGVhJTIwZHJpbmt8ZW58MXx8fHwxNzc1NDQyNzE1fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "2",
    name: "Taro Milk Tea",
    description: "Creamy taro blended with milk tea",
    basePrice: 32,
    category: "Milk Tea",
    image: "https://images.unsplash.com/photo-1717239318422-a3cc081cc30f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXJvJTIwbWlsayUyMHRlYSUyMHB1cnBsZSUyMGRyaW5rfGVufDF8fHx8MTc3NTQ0MjcxNnww&ixlib=rb-4.1.0&q=80&w=1080",
    isRecommended: true,
  },
  {
    id: "3",
    name: "Matcha Latte",
    description: "Premium Japanese matcha with milk",
    basePrice: 35,
    category: "Specialty",
    image: "https://images.unsplash.com/photo-1708572727896-117b5ea25a86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRjaGElMjBncmVlbiUyMHRlYSUyMGxhdHRlfGVufDF8fHx8MTc3NTQ0MjcxNnww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "4",
    name: "Brown Sugar Boba",
    description: "Brown sugar syrup with fresh milk and boba",
    basePrice: 35,
    category: "Specialty",
    image: "https://images.unsplash.com/photo-1741244133076-afcdda4befae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm93biUyMHN1Z2FyJTIwYm9iYSUyMHBlYXJsc3xlbnwxfHx8fDE3NzU0NDI3MTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    isRecommended: true,
  },
  {
    id: "5",
    name: "Thai Milk Tea",
    description: "Traditional Thai tea with condensed milk",
    basePrice: 30,
    category: "Milk Tea",
    image: "https://images.unsplash.com/photo-1773738650471-102f4a4e986a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGFpJTIwaWNlZCUyMHRlYSUyMG9yYW5nZXxlbnwxfHx8fDE3NzU0MjQ3NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    isRecommended: true,
  },
  {
    id: "6",
    name: "Honey Lemon Tea",
    description: "Refreshing lemon tea with honey",
    basePrice: 26,
    category: "Fruit Tea",
    image: "https://images.unsplash.com/photo-1555211652-5c6222f971bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZW1vbiUyMHRlYSUyMGhvbmV5JTIwZHJpbmt8ZW58MXx8fHwxNzc1NDQyNzE4fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "7",
    name: "Passion Fruit Green Tea",
    description: "Fresh passion fruit with green tea",
    basePrice: 28,
    category: "Fruit Tea",
    image: "https://images.unsplash.com/photo-1601390395693-364c0e22031a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXNzaW9uJTIwZnJ1aXQlMjB0ZWElMjBkcmlua3xlbnwxfHx8fDE3NzU0NDI3MTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "8",
    name: "Wintermelon Tea",
    description: "Sweet wintermelon flavor tea",
    basePrice: 25,
    category: "Specialty",
    image: "https://images.unsplash.com/photo-1771587693737-2bd7f22e732f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHRlYSUyMGRyaW5rJTIwY3VwfGVufDF8fHx8MTc3NTQ0MjcxOHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

export const toppings: DrinkTopping[] = [
  { id: "t1", name: "Boba Pearls", price: 5 },
  { id: "t2", name: "Crystal Jelly", price: 5 },
  { id: "t3", name: "Pudding", price: 5 },
  { id: "t4", name: "Aloe Vera", price: 5 },
  { id: "t5", name: "Grass Jelly", price: 5 },
  { id: "t6", name: "Red Bean", price: 5 },
];

export const sizeMultipliers = {
  small: 1,
  medium: 1.2,
  large: 1.4,
};