import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractRating(rating: string) {
  const match = rating.match(/\d+/); // matches first number
  return match ? parseInt(match[0]) : 0;
}