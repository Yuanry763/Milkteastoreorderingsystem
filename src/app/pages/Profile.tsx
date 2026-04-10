import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { storage } from "../utils/storage";
import { User, Coupon } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { UserCircle, Gift, Ticket, LogOut, Edit, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { DrinkCustomizer } from "../components/DrinkCustomizer";
import { drinks } from "../data/menu";
import { Drink } from "../types";

export function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showBuyOneGetOne, setShowBuyOneGetOne] = useState(false);
  const [selectedPaidDrink, setSelectedPaidDrink] = useState<Drink | null>(null);
  const [selectedFreeDrink, setSelectedFreeDrink] = useState<Drink | null>(null);
  const [customizingDrink, setCustomizingDrink] = useState<{ drink: Drink; type: "paid" | "free" } | null>(null);

  useEffect(() => {
    const currentUser = storage.getUser();
    if (!currentUser) {
      navigate("/");
      return;
    }
    setUser(currentUser);
    setName(currentUser.name);
  }, [navigate]);

  const handleUpdateProfile = () => {
    if (!user) return;

    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password && password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const updatedUser = { ...user, name };
    storage.setUser(updatedUser);
    setUser(updatedUser);
    setEditMode(false);
    setPassword("");
    setConfirmPassword("");
    toast.success("Profile updated successfully!");
  };

  const handleLogout = () => {
    storage.clearUser();
    storage.clearCart();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleRedeemBuyOneGetOne = () => {
    if (!user || user.points < 1500) {
      toast.error("You need at least 1500 points to redeem");
      return;
    }
    setShowBuyOneGetOne(true);
  };

  const handleConfirmBuyOneGetOne = () => {
    if (!selectedPaidDrink || !selectedFreeDrink) {
      toast.error("Please select both drinks");
      return;
    }

    if (selectedFreeDrink.basePrice > selectedPaidDrink.basePrice) {
      toast.error("Free drink must be equal or less in price than paid drink");
      return;
    }

    if (!user) return;

    // Deduct points
    const newPoints = user.points - 1500;
    storage.updateUserPoints(newPoints);
    setUser({ ...user, points: newPoints });

    toast.success("Buy One Get One redeemed! Drinks added to cart!");
    setShowBuyOneGetOne(false);
    setSelectedPaidDrink(null);
    setSelectedFreeDrink(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-HK", { year: "numeric", month: "short", day: "numeric" });
  };

  const getActiveCoupons = () => {
    if (!user) return [];
    return user.coupons.filter(c => !c.isUsed && new Date(c.expiryDate) > new Date());
  };

  const getUsedCoupons = () => {
    if (!user) return [];
    return user.coupons.filter(c => c.isUsed);
  };

  const getExpiredCoupons = () => {
    if (!user) return [];
    return user.coupons.filter(c => !c.isUsed && new Date(c.expiryDate) <= new Date());
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
            <UserCircle className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Account Information</CardTitle>
                {!editMode && (
                  <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Update
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!editMode ? (
                <>
                  <div>
                    <Label className="text-gray-600">Name</Label>
                    <p className="text-lg font-semibold">{user.name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Email</Label>
                    <p className="text-lg font-semibold">{user.email}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email} disabled className="bg-gray-50" />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password (optional)</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Leave blank to keep current password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {password && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateProfile} className="bg-gradient-to-r from-amber-500 to-orange-600">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setEditMode(false);
                      setName(user.name);
                      setPassword("");
                      setConfirmPassword("");
                    }}>
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Points */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-600" />
                Reward Points
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
                <div>
                  <p className="text-gray-600 mb-1">Your Points</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {user.points}
                  </p>
                </div>
                <Gift className="w-16 h-16 text-amber-500 opacity-50" />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Buy One Get One Free</h4>
                <p className="text-sm text-blue-700 mb-3">Redeem 1500 points for a buy one get one offer!</p>
                <Button
                  onClick={handleRedeemBuyOneGetOne}
                  disabled={user.points < 1500}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {user.points >= 1500 ? "Redeem Now" : `Need ${1500 - user.points} more points`}
                </Button>
              </div>

              <p className="text-sm text-gray-500">
                Earn 1 point for every HK$1 spent. Use points for discounts and special offers!
              </p>
            </CardContent>
          </Card>

          {/* Coupons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-orange-600" />
                My Coupons
              </CardTitle>
              <CardDescription>Festival coupons valid for 10 days - 20% off!</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="active">Active ({getActiveCoupons().length})</TabsTrigger>
                  <TabsTrigger value="used">Used ({getUsedCoupons().length})</TabsTrigger>
                  <TabsTrigger value="expired">Expired ({getExpiredCoupons().length})</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-3 mt-4">
                  {getActiveCoupons().length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No active coupons</p>
                  ) : (
                    getActiveCoupons().map((coupon) => (
                      <div key={coupon.id} className="p-4 border-2 border-orange-200 bg-orange-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-orange-900">{coupon.name}</h4>
                            <p className="text-sm text-orange-700">20% OFF</p>
                          </div>
                          <Badge className="bg-green-600">Active</Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-orange-600">
                          <Calendar className="w-3 h-3" />
                          <span>Valid until {formatDate(coupon.expiryDate)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="used" className="space-y-3 mt-4">
                  {getUsedCoupons().length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No used coupons</p>
                  ) : (
                    getUsedCoupons().map((coupon) => (
                      <div key={coupon.id} className="p-4 border bg-gray-50 rounded-lg opacity-60">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-700">{coupon.name}</h4>
                            <p className="text-sm text-gray-600">20% OFF</p>
                          </div>
                          <Badge variant="outline">Used</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="expired" className="space-y-3 mt-4">
                  {getExpiredCoupons().length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No expired coupons</p>
                  ) : (
                    getExpiredCoupons().map((coupon) => (
                      <div key={coupon.id} className="p-4 border bg-gray-50 rounded-lg opacity-60">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-700">{coupon.name}</h4>
                            <p className="text-sm text-gray-600">20% OFF</p>
                          </div>
                          <Badge variant="outline">Expired</Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>Expired on {formatDate(coupon.expiryDate)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Logout */}
          <Button
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Buy One Get One Dialog */}
      <Dialog open={showBuyOneGetOne} onOpenChange={setShowBuyOneGetOne}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buy One Get One Free</DialogTitle>
            <DialogDescription>Select one drink to pay for and one free drink (must be equal or lower price)</DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Paid Drink</h3>
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {drinks.map((drink) => (
                  <div
                    key={drink.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:border-orange-500 ${
                      selectedPaidDrink?.id === drink.id ? "border-orange-500 bg-orange-50" : ""
                    }`}
                    onClick={() => setSelectedPaidDrink(drink)}
                  >
                    <div className="flex items-center gap-3">
                      <img src={drink.image} alt={drink.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <p className="font-semibold">{drink.name}</p>
                        <p className="text-sm text-gray-600">HK${drink.basePrice}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Free Drink</h3>
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {drinks
                  .filter((drink) => !selectedPaidDrink || drink.basePrice <= selectedPaidDrink.basePrice)
                  .map((drink) => (
                    <div
                      key={drink.id}
                      className={`p-3 border rounded-lg cursor-pointer hover:border-green-500 ${
                        selectedFreeDrink?.id === drink.id ? "border-green-500 bg-green-50" : ""
                      } ${selectedPaidDrink && drink.basePrice > selectedPaidDrink.basePrice ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => {
                        if (!selectedPaidDrink || drink.basePrice <= selectedPaidDrink.basePrice) {
                          setSelectedFreeDrink(drink);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <img src={drink.image} alt={drink.name} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <p className="font-semibold">{drink.name}</p>
                          <p className="text-sm text-green-600">FREE (was HK${drink.basePrice})</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowBuyOneGetOne(false);
              setSelectedPaidDrink(null);
              setSelectedFreeDrink(null);
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmBuyOneGetOne}
              disabled={!selectedPaidDrink || !selectedFreeDrink}
              className="bg-gradient-to-r from-amber-500 to-orange-600"
            >
              Confirm & Add to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {customizingDrink && (
        <DrinkCustomizer
          drink={customizingDrink.drink}
          open={!!customizingDrink}
          onClose={() => setCustomizingDrink(null)}
        />
      )}
    </div>
  );
}
