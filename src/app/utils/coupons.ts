import { Coupon } from "../types";

export function generateCoupons(): Coupon[] {
  const now = new Date();
  const coupons: Coupon[] = [];

  // Festival dates for 2026
  const festivals = [
    { name: "Chinese New Year", date: new Date("2026-02-17") },
    { name: "Easter", date: new Date("2026-04-05") },
    { name: "Dragon Boat Festival", date: new Date("2026-06-19") },
    { name: "Mid-Autumn Festival", date: new Date("2026-10-06") },
    { name: "Christmas", date: new Date("2026-12-25") },
  ];

  festivals.forEach((festival) => {
    const expiryDate = new Date(festival.date);
    expiryDate.setDate(expiryDate.getDate() + 10); // 10 days from festival

    // Check if coupon is still valid
    if (expiryDate > now) {
      coupons.push({
        id: `coupon-${festival.name.toLowerCase().replace(/\s/g, "-")}`,
        name: `${festival.name} Special`,
        discount: 0.8, // 20% off
        expiryDate: expiryDate.toISOString(),
        isUsed: false,
      });
    }
  });

  return coupons;
}
