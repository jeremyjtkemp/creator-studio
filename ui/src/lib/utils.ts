import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Safe date formatting for Firebase Timestamps and regular dates
export function formatFirebaseDate(date: any, fallback: string = 'Unknown date'): string {
  try {
    if (!date) return fallback
    
    // Handle Firebase Timestamp
    if (date.toDate && typeof date.toDate === 'function') {
      return new Date(date.toDate()).toLocaleDateString()
    }
    
    // Handle regular Date or string
    return new Date(date).toLocaleDateString()
  } catch (error) {
    console.warn('Error formatting date:', error)
    return fallback
  }
}
