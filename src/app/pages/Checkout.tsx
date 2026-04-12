import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { storage } from "../utils/storage";
import { Order, CartItem } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Separator } from "../components/ui/separator";
import { Switch } from "../components/ui/switch";
import { CreditCard, Smartphone, Gift, Nfc, Ticket } from "lucide-react";
import { toast } from "sonner";

export function Checkout() {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [useCoupon, setUseCoupon] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);
  
  const user = storage.getUser();

  useEffect(() => {
    // Get items to checkout from session storage
    const itemsJson = sessionStorage.getItem('checkoutItems');
    if (itemsJson) {
      const items = JSON.parse(itemsJson);
      setCheckoutItems(items);
    } else {
      // Fallback to all cart items
      setCheckoutItems(storage.getCart());
    }

    // Check if mobile device
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  if (checkoutItems.length === 0) {
    return null;
  }

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const getActiveCoupons = () => {
    if (!user) return [];
    const now = new Date();
    const active = user.coupons.filter(c => 
      !c.isUsed && 
      new Date(c.startDate) <= now && 
      new Date(c.expiryDate) > now
    );
    // Sort by start date (earliest first) and return top 5
    return active.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).slice(0, 5);
  };
  const couponDiscount = useCoupon && selectedCouponId ? (subtotal * 0.2) : 0;
  const total = subtotal - couponDiscount;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please login to place an order");
      navigate("/");
      return;
    }

    setProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const allOrders = storage.getOrders();
    const queueNumber = allOrders.length + 1;

    const order: Order = {
      id: Math.random().toString(36).substring(7),
      userId: user.id,
      items: checkoutItems,
      totalAmount: total,
      status: "pending",
      queueNumber,
      createdAt: new Date().toISOString(),
      estimatedTime: 10 + Math.floor(Math.random() * 10), // 10-20 minutes
    };

    storage.addOrder(order);
    
    // Mark coupon as used if applicable
    if (useCoupon && selectedCouponId && user) {
      const updatedCoupons = user.coupons.map(c => 
        c.id === selectedCouponId ? { ...c, isUsed: true } : c
      );
      const updatedUser = { ...user, coupons: updatedCoupons };
      storage.setUser(updatedUser);
    }
    
    // Update user points - add earned points (based on final amount after discount)
    if (user) {
      const newPoints = user.points + Math.floor(total);
      storage.updateUserPoints(newPoints);
    }
    
    // Remove checked out items from cart
    const allCartItems = storage.getCart();
    const checkoutItemIds = new Set(checkoutItems.map(item => item.id));
    const remainingItems = allCartItems.filter(item => !checkoutItemIds.has(item.id));
    storage.setCart(remainingItems);
    
    // Clear checkout session
    sessionStorage.removeItem('checkoutItems');

    toast.success("Order placed successfully!");
    navigate(`/order/${order.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          Checkout
        </h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Coupon Selection */}
              {getActiveCoupons().length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ticket className="w-5 h-5 text-orange-600" />
                      Apply Coupon
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">You can use one coupon per order</p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-3 rounded-lg border cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          setUseCoupon(!useCoupon);
                          if (useCoupon) setSelectedCouponId(null);
                        }}>
                        <input 
                          type="checkbox" 
                          id="use-coupon"
                          checked={useCoupon}
                          onChange={() => {}}
                          className="cursor-pointer"
                        />
                        <label htmlFor="use-coupon" className="flex-1 cursor-pointer text-sm font-medium">
                          Use a coupon
                        </label>
                      </div>
                    </div>
                    
                    {useCoupon && (
                      <div className="space-y-2 pl-6">
                        <p className="text-xs text-gray-500">Select one coupon:</p>
                        <RadioGroup value={selectedCouponId || ""} onValueChange={setSelectedCouponId}>
                          {getActiveCoupons().map((coupon) => (
                            <div key={coupon.id} className="flex items-center space-x-2 p-3 rounded-lg border border-orange-200 bg-orange-50 cursor-pointer hover:border-orange-400">
                              <RadioGroupItem value={coupon.id} id={coupon.id} />
                              <Label htmlFor={coupon.id} className="flex-1 cursor-pointer">
                                <div>
                                  <p className="font-semibold text-orange-900">{coupon.name}</p>
                                  <p className="text-xs text-orange-600">Get 20% off</p>
                                </div>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="card" id="card" />
                      <CreditCard className="w-5 h-5" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        Credit/Debit Card
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="wechat" id="wechat" />
                      <Smartphone className="w-5 h-5 text-green-600" />
                      <Label htmlFor="wechat" className="flex-1 cursor-pointer">
                        WeChat Pay
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="alipay" id="alipay" />
                      <Smartphone className="w-5 h-5 text-blue-600" />
                      <Label htmlFor="alipay" className="flex-1 cursor-pointer">
                        AlipayHK
                      </Label>
                    </div>
                    <div className={`flex items-center space-x-3 p-4 border rounded-lg ${isMobile ? 'cursor-pointer hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}>
                      <RadioGroupItem value="octopus" id="octopus" disabled={!isMobile} />
                      <Nfc className="w-5 h-5 text-purple-600" />
                      <div className="flex-1">
                        <Label htmlFor="octopus" className={isMobile ? "cursor-pointer" : "cursor-not-allowed"}>
                          Octopus Card
                        </Label>
                        {!isMobile && (
                          <p className="text-xs text-gray-500">Mobile only</p>
                        )}
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Payment Details */}
              {paymentMethod === "card" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Card Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input id="cardName" placeholder="Name on card" required />
                    </div>
                  </CardContent>
                </Card>
              )}

              {(paymentMethod === "wechat" || paymentMethod === "alipay") && (
                <Card>
                  <CardHeader>
                    <CardTitle>{paymentMethod === "wechat" ? "WeChat Pay" : "AlipayHK"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                        <div className="text-gray-400">
                          <Smartphone className="w-16 h-16 mx-auto mb-2" />
                          <p className="text-sm">QR Code</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Scan QR code with your {paymentMethod === "wechat" ? "WeChat" : "AlipayHK"} app</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {paymentMethod === "octopus" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Octopus Card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="w-48 h-48 mx-auto bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center mb-4">
                        <Nfc className="w-24 h-24 text-purple-600 animate-pulse" />
                      </div>
                      <p className="text-lg font-semibold mb-2">Ready to tap</p>
                      <p className="text-sm text-gray-600">Hold your Octopus card near your device</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {checkoutItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.quantity}x {item.drink?.name || item.snack?.name}
                        </span>
                        <span>HK${item.totalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

  

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>HK${subtotal.toFixed(2)}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Coupon Discount (20%)</span>
                        <span>-HK${couponDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        HK${total.toFixed(2)}
                      </span>
                    </div>
                    {total > 0 && (
                      <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 p-2 rounded">
                        <Gift className="w-3 h-3" />
                        <span>You'll earn {Math.floor(total)} points from this order!</span>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600"
                    disabled={processing}
                  >
                    {processing ? "Processing..." : "Place Order"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/cart")}
                    disabled={processing}
                  >
                    Back to Cart
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}