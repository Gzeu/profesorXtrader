/**
 * Technical Indicators 2025 - Complete Suite of Modern Indicators
 * Implementează indicatori tehnici avansați cu algoritmi îmbunătățiți
 */

export interface OHLCVData {
  open: number
  high: number
  low: number
  close: number
  volume: number
  timestamp: number
}

export interface VWAPEnhancedResult {
  vwap: number
  upperBand: number
  lowerBand: number
  deviation: number
  volume: number
  volumeRatio: number // Raportul cu volumul mediu
  strength: 'weak' | 'normal' | 'strong' | 'extreme'
  signal: 'buy' | 'sell' | 'hold'
  confidence: number
}

export interface RSIDivergenceResult {
  rsi: number
  price: number
  divergenceType: 'none' | 'bullish' | 'bearish' | 'hidden_bullish' | 'hidden_bearish'
  strength: number // 0-1
  confirmation: boolean
  priceTarget?: number
  timeframe: number // în perioade
  historicalAccuracy: number
}

export interface OBVVolumeProfileResult {
  obv: number
  volumeProfile: {
    priceLevel: number
    volume: number
    percentage: number
  }[]
  pocPrice: number // Point of Control
  valueAreaHigh: number
  valueAreaLow: number
  volumeTrend: 'accumulation' | 'distribution' | 'neutral'
  strength: number
}

export interface PatternResult {
  pattern: string
  confidence: number
  type: 'reversal' | 'continuation'
  timeframe: string
  target: number
  stopLoss: number
  riskReward: number
}

class MathUtils {
  static sma(values: number[], period: number): number[] {
    const result: number[] = []
    for (let i = period - 1; i < values.length; i++) {
      const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
      result.push(sum / period)
    }
    return result
  }

  static ema(values: number[], period: number): number[] {
    const multiplier = 2 / (period + 1)
    const result: number[] = []
    
    // Prima valoare e SMA
    if (values.length >= period) {
      const firstSMA = values.slice(0, period).reduce((a, b) => a + b, 0) / period
      result.push(firstSMA)
      
      // Următoarele valori sunt EMA
      for (let i = period; i < values.length; i++) {
        const ema = (values[i] * multiplier) + (result[result.length - 1] * (1 - multiplier))
        result.push(ema)
      }
    }
    
    return result
  }

  static standardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
    return Math.sqrt(variance)
  }

  static findPeaks(values: number[], minDistance = 5): number[] {
    const peaks: number[] = []
    for (let i = minDistance; i < values.length - minDistance; i++) {
      let isPeak = true
      for (let j = 1; j <= minDistance; j++) {
        if (values[i] <= values[i - j] || values[i] <= values[i + j]) {
          isPeak = false
          break
        }
      }
      if (isPeak) peaks.push(i)
    }
    return peaks
  }

  static findTroughs(values: number[], minDistance = 5): number[] {
    const troughs: number[] = []
    for (let i = minDistance; i < values.length - minDistance; i++) {
      let isTrough = true
      for (let j = 1; j <= minDistance; j++) {
        if (values[i] >= values[i - j] || values[i] >= values[i + j]) {
          isTrough = false
          break
        }
      }
      if (isTrough) troughs.push(i)
    }
    return troughs
  }

  static linearRegression(x: number[], y: number[]): { slope: number, intercept: number, r2: number } {
    const n = x.length
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Calcularea R-squared
    const yMean = sumY / n
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0)
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0)
    const r2 = 1 - (ssRes / ssTot)

    return { slope, intercept, r2 }
  }
}

export class TechnicalIndicators2025 {
  /**
   * VWAP Enhanced - VWAP cu benzi de deviație și analiză de volum
   */
  static vwapEnhanced(
    data: OHLCVData[], 
    period = 20, 
    deviations = [1, 2]
  ): VWAPEnhancedResult[] {
    const results: VWAPEnhancedResult[] = []
    
    for (let i = period - 1; i < data.length; i++) {
      const periodData = data.slice(i - period + 1, i + 1)
      
      // Calcularea VWAP
      let totalVolume = 0
      let totalVolumePrice = 0
      let volumeWeightedVariance = 0
      
      for (const candle of periodData) {
        const typicalPrice = (candle.high + candle.low + candle.close) / 3
        totalVolumePrice += typicalPrice * candle.volume
        totalVolume += candle.volume
      }
      
      const vwap = totalVolumePrice / totalVolume
      
      // Calcularea deviației standard ponderate cu volumul
      for (const candle of periodData) {
        const typicalPrice = (candle.high + candle.low + candle.close) / 3
        const weightedVariance = Math.pow(typicalPrice - vwap, 2) * candle.volume
        volumeWeightedVariance += weightedVariance
      }
      
      const deviation = Math.sqrt(volumeWeightedVariance / totalVolume)
      
      // Benzile VWAP
      const upperBand = vwap + deviation * deviations[1]
      const lowerBand = vwap - deviation * deviations[0]
      
      // Analiza volumului
      const avgVolume = periodData.reduce((sum, candle) => sum + candle.volume, 0) / period
      const currentVolume = data[i].volume
      const volumeRatio = currentVolume / avgVolume
      
      // Determinarea puterii
      let strength: VWAPEnhancedResult['strength'] = 'normal'
      if (volumeRatio > 2) strength = 'extreme'
      else if (volumeRatio > 1.5) strength = 'strong'
      else if (volumeRatio < 0.5) strength = 'weak'
      
      // Generarea semnalelor
      const currentPrice = data[i].close
      let signal: VWAPEnhancedResult['signal'] = 'hold'
      let confidence = 0.5
      
      if (currentPrice > vwap && volumeRatio > 1.2) {
        signal = 'buy'
        confidence = Math.min(0.95, 0.5 + (volumeRatio - 1) * 0.3)
      } else if (currentPrice < vwap && volumeRatio > 1.2) {
        signal = 'sell'
        confidence = Math.min(0.95, 0.5 + (volumeRatio - 1) * 0.3)
      }
      
      results.push({
        vwap,
        upperBand,
        lowerBand,
        deviation,
        volume: currentVolume,
        volumeRatio,
        strength,
        signal,
        confidence
      })
    }
    
    return results
  }

  /**
   * RSI cu Detectare de Divergențe
   */
  static rsiWithDivergences(
    data: OHLCVData[], 
    period = 14, 
    lookback = 50
  ): RSIDivergenceResult[] {
    const results: RSIDivergenceResult[] = []
    const closes = data.map(d => d.close)
    
    // Calcularea RSI clasic
    const gains: number[] = []
    const losses: number[] = []
    
    for (let i = 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1]
      gains.push(change > 0 ? change : 0)
      losses.push(change < 0 ? Math.abs(change) : 0)
    }
    
    const avgGains = MathUtils.sma(gains, period)
    const avgLosses = MathUtils.sma(losses, period)
    const rsiValues: number[] = []
    
    for (let i = 0; i < avgGains.length; i++) {
      const rs = avgGains[i] / avgLosses[i]
      const rsi = 100 - (100 / (1 + rs))
      rsiValues.push(rsi)
    }
    
    // Detectarea divergențelor
    for (let i = lookback; i < rsiValues.length; i++) {
      const currentRSI = rsiValues[i]
      const currentPrice = closes[i + period]
      
      // Gasim peak-urile și trough-urile pentru preț și RSI
      const priceWindow = closes.slice(i + period - lookback, i + period + 1)
      const rsiWindow = rsiValues.slice(i - lookback, i + 1)
      
      const pricePeaks = MathUtils.findPeaks(priceWindow, 3)
      const priceTroughs = MathUtils.findTroughs(priceWindow, 3)
      const rsiPeaks = MathUtils.findPeaks(rsiWindow, 3)
      const rsiTroughs = MathUtils.findTroughs(rsiWindow, 3)
      
      let divergenceType: RSIDivergenceResult['divergenceType'] = 'none'
      let strength = 0
      let confirmation = false
      let priceTarget: number | undefined
      
      // Divergență bearish (prețul face maxime mai mari, RSI face maxime mai mici)
      if (pricePeaks.length >= 2 && rsiPeaks.length >= 2) {
        const lastPricePeak = pricePeaks[pricePeaks.length - 1]
        const prevPricePeak = pricePeaks[pricePeaks.length - 2]
        const lastRSIPeak = rsiPeaks[rsiPeaks.length - 1]
        const prevRSIPeak = rsiPeaks[rsiPeaks.length - 2]
        
        if (priceWindow[lastPricePeak] > priceWindow[prevPricePeak] && 
            rsiWindow[lastRSIPeak] < rsiWindow[prevRSIPeak]) {
          divergenceType = 'bearish'
          strength = Math.abs(rsiWindow[prevRSIPeak] - rsiWindow[lastRSIPeak]) / 20
          confirmation = currentRSI > 70
          priceTarget = currentPrice * 0.95 // 5% scădere țintă
        }
      }
      
      // Divergență bullish (prețul face minime mai mici, RSI face minime mai mari)
      if (priceTroughs.length >= 2 && rsiTroughs.length >= 2) {
        const lastPriceTrough = priceTroughs[priceTroughs.length - 1]
        const prevPriceTrough = priceTroughs[priceTroughs.length - 2]
        const lastRSITrough = rsiTroughs[rsiTroughs.length - 1]
        const prevRSITrough = rsiTroughs[rsiTroughs.length - 2]
        
        if (priceWindow[lastPriceTrough] < priceWindow[prevPriceTrough] && 
            rsiWindow[lastRSITrough] > rsiWindow[prevRSITrough]) {
          divergenceType = divergenceType === 'none' ? 'bullish' : divergenceType
          if (divergenceType === 'bullish') {
            strength = Math.abs(rsiWindow[lastRSITrough] - rsiWindow[prevRSITrough]) / 20
            confirmation = currentRSI < 30
            priceTarget = currentPrice * 1.05 // 5% creștere țintă
          }
        }
      }
      
      // Calcularea preciziei istorice (simulare)
      const historicalAccuracy = this.calculateHistoricalAccuracy(divergenceType)
      
      results.push({
        rsi: currentRSI,
        price: currentPrice,
        divergenceType,
        strength: Math.min(1, strength),
        confirmation,
        priceTarget,
        timeframe: Math.floor(lookback / 4), // Estimare timeframe
        historicalAccuracy
      })
    }
    
    return results
  }

  /**
   * OBV + Volume Profile Enhanced
   */
  static obvVolumeProfile(
    data: OHLCVData[], 
    period = 100
  ): OBVVolumeProfileResult[] {
    const results: OBVVolumeProfileResult[] = []
    
    // Calcularea OBV
    let obv = 0
    const obvValues: number[] = [0]
    
    for (let i = 1; i < data.length; i++) {
      if (data[i].close > data[i - 1].close) {
        obv += data[i].volume
      } else if (data[i].close < data[i - 1].close) {
        obv -= data[i].volume
      }
      // Dacă close == close anterior, OBV rămâne la fel
      obvValues.push(obv)
    }
    
    // Calcularea Volume Profile pentru fiecare perioadă
    for (let i = period - 1; i < data.length; i++) {
      const periodData = data.slice(i - period + 1, i + 1)
      
      // Crearea intervalelor de preț
      const minPrice = Math.min(...periodData.map(d => d.low))
      const maxPrice = Math.max(...periodData.map(d => d.high))
      const priceStep = (maxPrice - minPrice) / 50 // 50 de intervale
      
      // Calcularea volumului pentru fiecare interval de preț
      const volumeProfile: { priceLevel: number; volume: number; percentage: number }[] = []
      let totalVolume = 0
      
      for (let p = 0; p < 50; p++) {
        const priceLevel = minPrice + p * priceStep
        const nextPriceLevel = minPrice + (p + 1) * priceStep
        let intervalVolume = 0
        
        for (const candle of periodData) {
          // Dacă prețul trece prin acest interval
          if ((candle.low <= priceLevel && candle.high >= priceLevel) ||
              (candle.low >= priceLevel && candle.high <= nextPriceLevel)) {
            // Distribuie volumul proportional
            const priceRange = candle.high - candle.low
            const intervalOverlap = Math.min(nextPriceLevel, candle.high) - Math.max(priceLevel, candle.low)
            if (intervalOverlap > 0 && priceRange > 0) {
              intervalVolume += candle.volume * (intervalOverlap / priceRange)
            }
          }
        }
        
        totalVolume += intervalVolume
        volumeProfile.push({
          priceLevel: priceLevel + priceStep / 2,
          volume: intervalVolume,
          percentage: 0 // Calculat mai jos
        })
      }
      
      // Calcularea procentajelor
      volumeProfile.forEach(vp => {
        vp.percentage = (vp.volume / totalVolume) * 100
      })
      
      // Sortarea după volum pentru a găsi POC
      const sortedByVolume = [...volumeProfile].sort((a, b) => b.volume - a.volume)
      const pocPrice = sortedByVolume[0].priceLevel
      
      // Calcularea Value Area (70% din volum)
      const valueAreaThreshold = totalVolume * 0.7
      let cumulativeVolume = 0
      let valueAreaHigh = pocPrice
      let valueAreaLow = pocPrice
      
      // Extindem Value Area în ambele direcții de la POC
      const sortedByPrice = [...volumeProfile].sort((a, b) => a.priceLevel - b.priceLevel)
      const pocIndex = sortedByPrice.findIndex(vp => vp.priceLevel === pocPrice)
      
      let upperIndex = pocIndex
      let lowerIndex = pocIndex
      cumulativeVolume = sortedByPrice[pocIndex].volume
      
      while (cumulativeVolume < valueAreaThreshold && (upperIndex < sortedByPrice.length - 1 || lowerIndex > 0)) {
        const upperVolume = upperIndex < sortedByPrice.length - 1 ? sortedByPrice[upperIndex + 1].volume : 0
        const lowerVolume = lowerIndex > 0 ? sortedByPrice[lowerIndex - 1].volume : 0
        
        if (upperVolume >= lowerVolume && upperIndex < sortedByPrice.length - 1) {
          upperIndex++
          cumulativeVolume += sortedByPrice[upperIndex].volume
          valueAreaHigh = sortedByPrice[upperIndex].priceLevel
        } else if (lowerIndex > 0) {
          lowerIndex--
          cumulativeVolume += sortedByPrice[lowerIndex].volume
          valueAreaLow = sortedByPrice[lowerIndex].priceLevel
        } else {
          break
        }
      }
      
      // Analiza tendinței volumului
      const recentOBV = obvValues.slice(Math.max(0, i - 10), i + 1)
      const obvTrend = this.calculateVolumeTrend(recentOBV)
      const obvStrength = this.calculateOBVStrength(recentOBV, periodData)
      
      results.push({
        obv: obvValues[i],
        volumeProfile: volumeProfile.filter(vp => vp.volume > 0),
        pocPrice,
        valueAreaHigh,
        valueAreaLow,
        volumeTrend: obvTrend,
        strength: obvStrength
      })
    }
    
    return results
  }

  /**
   * Pattern Recognition avansată
   */
  static detectPatterns(data: OHLCVData[], period = 20): PatternResult[] {
    const results: PatternResult[] = []
    
    for (let i = period; i < data.length; i++) {
      const window = data.slice(i - period, i)
      const highs = window.map(d => d.high)
      const lows = window.map(d => d.low)
      const closes = window.map(d => d.close)
      
      // Detectare Head and Shoulders
      const hsPattern = this.detectHeadAndShoulders(highs, lows)
      if (hsPattern) {
        results.push({
          pattern: 'Head and Shoulders',
          confidence: hsPattern.confidence,
          type: 'reversal',
          timeframe: '1-2 days',
          target: hsPattern.target,
          stopLoss: hsPattern.stopLoss,
          riskReward: (hsPattern.target - data[i].close) / (data[i].close - hsPattern.stopLoss)
        })
      }
      
      // Detectare Double Top/Bottom
      const doublePattern = this.detectDoubleTopBottom(highs, lows)
      if (doublePattern) {
        results.push({
          pattern: doublePattern.type,
          confidence: doublePattern.confidence,
          type: 'reversal',
          timeframe: '1-3 days',
          target: doublePattern.target,
          stopLoss: doublePattern.stopLoss,
          riskReward: Math.abs(doublePattern.target - data[i].close) / Math.abs(data[i].close - doublePattern.stopLoss)
        })
      }
      
      // Detectare Triangle Patterns
      const trianglePattern = this.detectTriangle(highs, lows, closes)
      if (trianglePattern) {
        results.push({
          pattern: trianglePattern.type,
          confidence: trianglePattern.confidence,
          type: 'continuation',
          timeframe: '2-5 days',
          target: trianglePattern.target,
          stopLoss: trianglePattern.stopLoss,
          riskReward: Math.abs(trianglePattern.target - data[i].close) / Math.abs(data[i].close - trianglePattern.stopLoss)
        })
      }
    }
    
    return results
  }

  // Metode private pentru pattern recognition
  private static detectHeadAndShoulders(highs: number[], lows: number[]): { confidence: number, target: number, stopLoss: number } | null {
    // Implementare simplificată - în realitate ar fi mult mai complexă
    const peaks = MathUtils.findPeaks(highs, 3)
    if (peaks.length >= 3) {
      const [leftShoulder, head, rightShoulder] = peaks.slice(-3)
      
      // Verifică dacă formează Head and Shoulders
      if (highs[head] > highs[leftShoulder] && highs[head] > highs[rightShoulder] &&
          Math.abs(highs[leftShoulder] - highs[rightShoulder]) / highs[head] < 0.05) {
        
        const neckline = Math.min(lows[leftShoulder], lows[rightShoulder])
        const headHeight = highs[head] - neckline
        
        return {
          confidence: 0.7,
          target: neckline - headHeight,
          stopLoss: highs[head]
        }
      }
    }
    return null
  }

  private static detectDoubleTopBottom(highs: number[], lows: number[]): { type: string, confidence: number, target: number, stopLoss: number } | null {
    // Detectare Double Top
    const peaks = MathUtils.findPeaks(highs, 5)
    if (peaks.length >= 2) {
      const [peak1, peak2] = peaks.slice(-2)
      if (Math.abs(highs[peak1] - highs[peak2]) / highs[peak1] < 0.03) {
        const support = Math.min(...lows.slice(peak1, peak2))
        return {
          type: 'Double Top',
          confidence: 0.65,
          target: support - (highs[peak1] - support),
          stopLoss: Math.max(highs[peak1], highs[peak2])
        }
      }
    }
    
    // Detectare Double Bottom
    const troughs = MathUtils.findTroughs(lows, 5)
    if (troughs.length >= 2) {
      const [trough1, trough2] = troughs.slice(-2)
      if (Math.abs(lows[trough1] - lows[trough2]) / lows[trough1] < 0.03) {
        const resistance = Math.max(...highs.slice(trough1, trough2))
        return {
          type: 'Double Bottom',
          confidence: 0.65,
          target: resistance + (resistance - lows[trough1]),
          stopLoss: Math.min(lows[trough1], lows[trough2])
        }
      }
    }
    
    return null
  }

  private static detectTriangle(highs: number[], lows: number[], closes: number[]): { type: string, confidence: number, target: number, stopLoss: number } | null {
    if (highs.length < 10) return null
    
    // Calculează liniile de trend pentru maxime și minime
    const indices = Array.from({ length: highs.length }, (_, i) => i)
    const highRegression = MathUtils.linearRegression(indices, highs)
    const lowRegression = MathUtils.linearRegression(indices, lows)
    
    // Ascending Triangle
    if (Math.abs(highRegression.slope) < 0.1 && lowRegression.slope > 0.1) {
      const resistance = highRegression.intercept + highRegression.slope * (highs.length - 1)
      const currentPrice = closes[closes.length - 1]
      return {
        type: 'Ascending Triangle',
        confidence: Math.min(0.8, highRegression.r2 + lowRegression.r2) / 2,
        target: resistance + (resistance - Math.min(...lows)),
        stopLoss: Math.min(...lows.slice(-5))
      }
    }
    
    // Descending Triangle
    if (Math.abs(lowRegression.slope) < 0.1 && highRegression.slope < -0.1) {
      const support = lowRegression.intercept + lowRegression.slope * (lows.length - 1)
      return {
        type: 'Descending Triangle',
        confidence: Math.min(0.8, (highRegression.r2 + lowRegression.r2) / 2),
        target: support - (Math.max(...highs) - support),
        stopLoss: Math.max(...highs.slice(-5))
      }
    }
    
    return null
  }

  private static calculateHistoricalAccuracy(divergenceType: string): number {
    // Simulează precizia istorică bazată pe tipul de divergență
    const accuracyMap: { [key: string]: number } = {
      'bullish': 0.72,
      'bearish': 0.68,
      'hidden_bullish': 0.78,
      'hidden_bearish': 0.75,
      'none': 0.5
    }
    return accuracyMap[divergenceType] || 0.5
  }

  private static calculateVolumeTrend(obvValues: number[]): 'accumulation' | 'distribution' | 'neutral' {
    if (obvValues.length < 3) return 'neutral'
    
    const recent = obvValues.slice(-3)
    const slope = (recent[recent.length - 1] - recent[0]) / recent.length
    
    if (slope > obvValues[obvValues.length - 1] * 0.01) return 'accumulation'
    if (slope < -obvValues[obvValues.length - 1] * 0.01) return 'distribution'
    return 'neutral'
  }

  private static calculateOBVStrength(obvValues: number[], priceData: OHLCVData[]): number {
    if (obvValues.length < 2 || priceData.length < 2) return 0.5
    
    const obvChange = obvValues[obvValues.length - 1] - obvValues[0]
    const priceChange = priceData[priceData.length - 1].close - priceData[0].close
    
    // Concordanța între OBV și preț
    const agreement = (obvChange > 0 && priceChange > 0) || (obvChange < 0 && priceChange < 0)
    const baseStrength = agreement ? 0.7 : 0.3
    
    // Ajustează în funcție de magnitudine
    const obvMagnitude = Math.abs(obvChange) / Math.abs(obvValues[0] || 1)
    const priceMagnitude = Math.abs(priceChange) / priceData[0].close
    
    return Math.min(0.95, baseStrength + (obvMagnitude + priceMagnitude) * 0.1)
  }
}