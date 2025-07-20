import type { Hotel } from "../types/hotel";

export function getMinMaxPrices(hotels: Hotel[]): [number, number] {
  let minPrice = Infinity;
  let maxPrice = 0;

  hotels.forEach(hotel => {
    const price = hotel.roomResponses?.[0]?.rateKeyResponses?.totalPrice;
    if (price) {
      minPrice = Math.min(minPrice, price);
      maxPrice = Math.max(maxPrice, price);
    }
  });

  return [
    minPrice === Infinity ? 0 : minPrice,
    maxPrice === 0 ? 100000 : maxPrice
  ];
}

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString()}`;
} 