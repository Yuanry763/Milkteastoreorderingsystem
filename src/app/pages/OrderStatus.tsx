import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { storage } from "../utils/storage";
import { Order } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Progress } from "../components/ui/progress";
import { Clock, CheckCircle, Package, PartyPopper } from "lucide-react";
import { toast } from "sonner";

export function OrderStatus() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!orderId) {
      navigate("/menu");
      return;
    }

    const loadedOrder = storage.getOrder(orderId);
    if (!loadedOrder) {
      toast.error("Order not found");
      navigate("/menu");
      return;
    }

    setOrder(loadedOrder);
    setTimeRemaining(loadedOrder.estimatedTime * 60); // Convert to seconds

    // Simulate order progression
    const statusInterval = setInterval(() => {
      const currentOrder = storage.getOrder(orderId);
      if (!currentOrder) return;

      if (currentOrder.status === "pending") {
        storage.updateOrder(orderId, { status: "preparing" });
        setOrder({ ...currentOrder, status: "preparing" });
        toast.info("Your order is now being prepared!");
      } else if (currentOrder.status === "preparing") {
        storage.updateOrder(orderId, { status: "ready" });
        setOrder({ ...currentOrder, status: "ready" });
        toast.success("🎉 Your order is ready for pickup!", {
          duration: 10000,
        });
      }
    }, loadedOrder.estimatedTime * 1000 / 2); // Change status halfway through

    // Countdown timer
    const timerInterval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(timerInterval);
    };
  }, [orderId, navigate]);

  if (!order) {
    return null;
  }

  const getStatusColor = () => {
    switch (order.status) {
      case "pending":
        return "bg-yellow-500";
      case "preparing":
        return "bg-blue-500";
      case "ready":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = () => {
    switch (order.status) {
      case "pending":
        return <Clock className="w-6 h-6" />;
      case "preparing":
        return <Package className="w-6 h-6" />;
      case "ready":
        return <PartyPopper className="w-6 h-6" />;
      default:
        return <CheckCircle className="w-6 h-6" />;
    }
  };

  const getProgress = () => {
    switch (order.status) {
      case "pending":
        return 25;
      case "preparing":
        return 60;
      case "ready":
        return 100;
      default:
        return 0;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Order Status
          </h1>
          <p className="text-gray-600">Track your order in real-time</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Order #{order.queueNumber}</CardTitle>
              <Badge className={getStatusColor()}>
                {order.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Progress */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
                <div className="text-amber-600">{getStatusIcon()}</div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {order.queueNumber}
                  </div>
                  <div className="text-sm text-gray-600">Queue Number</div>
                </div>
              </div>

              <Progress value={getProgress()} className="h-2" />

              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className={order.status === "pending" ? "font-semibold text-amber-600" : "text-gray-400"}>
                  Pending
                </div>
                <div className={order.status === "preparing" ? "font-semibold text-blue-600" : "text-gray-400"}>
                  Preparing
                </div>
                <div className={order.status === "ready" ? "font-semibold text-green-600" : "text-gray-400"}>
                  Ready
                </div>
              </div>
            </div>

            <Separator />

            {/* Time Remaining */}
            {order.status !== "ready" && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Estimated Time</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(timeRemaining)}
                </div>
              </div>
            )}

            {order.status === "ready" && (
              <div className="text-center p-6 bg-green-50 rounded-lg border-2 border-green-200">
                <PartyPopper className="w-12 h-12 mx-auto mb-2 text-green-600" />
                <div className="text-xl font-bold text-green-700 mb-1">
                  Your Order is Ready!
                </div>
                <div className="text-sm text-green-600">
                  Please proceed to the counter to collect your order
                </div>
              </div>
            )}

            <Separator />

            {/* Order Items */}
            <div>
              <h3 className="font-semibold mb-3">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start text-sm">
                    <div className="flex-1">
                      <div className="font-medium">
                        {item.quantity}x {item.drink?.name || item.snack?.name}
                      </div>
                      {item.drink && item.customization && (
                        <>
                          <div className="text-xs text-gray-600">
                            {item.customization.size.charAt(0).toUpperCase() + item.customization.size.slice(1)} • {item.customization.sugarLevel}% Sugar • {item.customization.iceLevel}% Ice
                          </div>
                          {item.customization.toppings && item.customization.toppings.length > 0 && (
                            <div className="text-xs text-gray-600">
                              + {item.customization.toppings.map((t) => t.name).join(", ")}
                            </div>
                          )}
                        </>
                      )}
                      {item.snack && (
                        <div className="text-xs text-gray-600">
                          {item.snack.category}
                        </div>
                      )}
                    </div>
                    <div className="font-medium">HK${item.totalPrice.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total Paid</span>
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                HK${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/menu")}
          >
            Order More
          </Button>
          {order.status === "ready" && (
            <Button
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600"
              onClick={() => {
                storage.updateOrder(order.id, { status: "completed" });
                toast.success("Thank you! Enjoy your drinks!");
                navigate("/menu");
              }}
            >
              Mark as Collected
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}