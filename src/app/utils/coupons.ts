import { Coupon } from "../types";

export function generateCoupons(): Coupon[] {
  const now = new Date();
  const coupons: Coupon[] = [];

  // HK Festival dates for 2026
  const festivals = [
    { name: "Chinese New Year", date: new Date("2026-02-17") },
    { name: "Ching Ming Festival", date: new Date("2026-04-05") },
    { name: "Dragon Boat Festival", date: new Date("2026-06-10") },
    { name: "Mid-Autumn Festival", date: new Date("2026-10-06") },
    { name: "National Day", date: new Date("2026-10-01") },
    { name: "Christmas", date: new Date("2026-12-25") },
  ];

  festivals.forEach((festival) => {
    const startDate = new Date(festival.date);
    const expiryDate = new Date(festival.date);
    expiryDate.setDate(expiryDate.getDate() + 10); // 10 days from festival

    // Only include coupons that haven't expired yet
    if (expiryDate > now) {
      coupons.push({
        id: `coupon-${festival.name.toLowerCase().replace(/\s/g, "-")}`,
        name: `${festival.name} Special`,
        discount: 0.8, // 20% off
        startDate: startDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        isUsed: false,
      });
    }
  });

  return coupons;
}
