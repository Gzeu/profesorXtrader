import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatează un număr ca valută USD
 */
export function formatCurrency(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

/**
 * Formatează un procent cu semnul corespunzător
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    signDisplay: 'always'
  }).format(value / 100)
  
  return formatted
}

/**
 * Formatează un număr cu separatori de mii
 */
export function formatNumber(num: number, decimals: number = 8): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * Determină clasa CSS pentru afișarea prețurilor (verde/roșu)
 */
export function getPriceChangeClass(value: number): string {
  if (value > 0) return 'text-profit'
  if (value < 0) return 'text-loss'
  return 'text-muted-foreground'
}

/**
 * Determină trendul prețului (up/down/neutral)
 */
export function getPriceTrend(current: number, previous: number): 'up' | 'down' | 'neutral' {
  if (current > previous) return 'up'
  if (current < previous) return 'down'
  return 'neutral'
}

/**
 * Calculează procentajul de schimbare între două valori
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

/**
 * Validează API key-ul Binance
 */
export function validateBinanceApiKey(apiKey: string): boolean {
  return /^[A-Za-z0-9]{64}$/.test(apiKey)
}

/**
 * Validează secret key-ul Binance
 */
export function validateBinanceSecretKey(secretKey: string): boolean {
  return /^[A-Za-z0-9]{64}$/.test(secretKey)
}

/**
 * Formatează timestamp-ul pentru afișare
 */
export function formatTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(timestamp))
}

/**
 * Debounce function pentru optimizarea performanțelor
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    
    timeout = setTimeout(() => {
      func.apply(null, args)
    }, wait)
  }
}

/**
 * Throttle function pentru limitarea ratei de execuție
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args)
      inThrottle = true
      
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}
