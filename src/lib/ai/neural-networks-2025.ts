/**
 * Neural Networks 2025 - Advanced Predictive Analysis
 * Implementează rețele neuronale moderne pentru analiză predictivă de pieață
 */

import { Matrix } from 'ml-matrix'

export interface NeuralNetworkConfig {
  inputSize: number
  hiddenLayers: number[]
  outputSize: number
  activationFunction: 'relu' | 'sigmoid' | 'tanh' | 'leaky_relu' | 'swish'
  learningRate: number
  epochs: number
  batchSize: number
  regularization?: {
    l1?: number
    l2?: number
    dropout?: number
  }
  optimizer: 'sgd' | 'adam' | 'rmsprop' | 'adagrad'
}

export interface TrainingData {
  inputs: number[][]
  targets: number[][]
  validation?: {
    inputs: number[][]
    targets: number[][]
  }
}

export interface PredictionResult {
  prediction: number[]
  confidence: number
  probability: number
  analysis: {
    trend: 'bullish' | 'bearish' | 'neutral'
    strength: number // 0-1
    timeframe: string
    risk: 'low' | 'medium' | 'high'
  }
  microsecondTimestamp: number
}

export interface PatternRecognitionResult {
  pattern: string
  confidence: number
  description: string
  historicalAccuracy: number
  expectedDuration: number // în minutes
  priceTarget?: number
  stopLoss?: number
}

export interface SentimentAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral'
  score: number // -1 la +1
  magnitude: number // 0-1
  emotions: {
    fear: number
    greed: number
    uncertainty: number
    confidence: number
  }
  sources: string[]
  timestamp: number
}

class ActivationFunctions {
  static relu(x: number): number {
    return Math.max(0, x)
  }

  static reluDerivative(x: number): number {
    return x > 0 ? 1 : 0
  }

  static sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x))
  }

  static sigmoidDerivative(x: number): number {
    const s = this.sigmoid(x)
    return s * (1 - s)
  }

  static tanh(x: number): number {
    return Math.tanh(x)
  }

  static tanhDerivative(x: number): number {
    const t = Math.tanh(x)
    return 1 - t * t
  }

  static leakyRelu(x: number, alpha = 0.01): number {
    return x > 0 ? x : alpha * x
  }

  static leakyReluDerivative(x: number, alpha = 0.01): number {
    return x > 0 ? 1 : alpha
  }

  static swish(x: number): number {
    return x * this.sigmoid(x)
  }

  static swishDerivative(x: number): number {
    const s = this.sigmoid(x)
    return s + x * s * (1 - s)
  }
}

export class NeuralNetwork2025 {
  private weights: Matrix[]
  private biases: Matrix[]
  private config: NeuralNetworkConfig
  private trainingHistory: {
    epoch: number
    loss: number
    accuracy: number
    validationLoss?: number
    validationAccuracy?: number
  }[] = []
  private adamParams?: {
    m: Matrix[]
    v: Matrix[]
    beta1: number
    beta2: number
    epsilon: number
  }

  constructor(config: NeuralNetworkConfig) {
    this.config = config
    this.initializeWeights()
    this.initializeOptimizer()
  }

  private initializeWeights(): void {
    const { inputSize, hiddenLayers, outputSize } = this.config
    const layers = [inputSize, ...hiddenLayers, outputSize]
    
    this.weights = []
    this.biases = []

    for (let i = 0; i < layers.length - 1; i++) {
      const currentSize = layers[i]
      const nextSize = layers[i + 1]
      
      // Xavier/Glorot initialization
      const scale = Math.sqrt(2 / (currentSize + nextSize))
      const weightMatrix = Matrix.random(nextSize, currentSize).mul(scale)
      const biasMatrix = Matrix.zeros(nextSize, 1)
      
      this.weights.push(weightMatrix)
      this.biases.push(biasMatrix)
    }
  }

  private initializeOptimizer(): void {
    if (this.config.optimizer === 'adam') {
      this.adamParams = {
        m: this.weights.map(w => Matrix.zeros(w.rows, w.columns)),
        v: this.weights.map(w => Matrix.zeros(w.rows, w.columns)),
        beta1: 0.9,
        beta2: 0.999,
        epsilon: 1e-8
      }
    }
  }

  private activate(x: number, func: string): number {
    switch (func) {
      case 'relu': return ActivationFunctions.relu(x)
      case 'sigmoid': return ActivationFunctions.sigmoid(x)
      case 'tanh': return ActivationFunctions.tanh(x)
      case 'leaky_relu': return ActivationFunctions.leakyRelu(x)
      case 'swish': return ActivationFunctions.swish(x)
      default: return x
    }
  }

  private activateDerivative(x: number, func: string): number {
    switch (func) {
      case 'relu': return ActivationFunctions.reluDerivative(x)
      case 'sigmoid': return ActivationFunctions.sigmoidDerivative(x)
      case 'tanh': return ActivationFunctions.tanhDerivative(x)
      case 'leaky_relu': return ActivationFunctions.leakyReluDerivative(x)
      case 'swish': return ActivationFunctions.swishDerivative(x)
      default: return 1
    }
  }

  predict(input: number[]): PredictionResult {
    const startTime = performance.now()
    
    let activation = new Matrix([input]).transpose()
    const activations: Matrix[] = [activation]

    // Forward pass
    for (let i = 0; i < this.weights.length; i++) {
      const z = this.weights[i].mmul(activation).add(this.biases[i])
      
      // Apply activation function
      const isOutputLayer = i === this.weights.length - 1
      const activationFunc = isOutputLayer ? 'sigmoid' : this.config.activationFunction
      
      activation = z.apply((row, col, value) => this.activate(value, activationFunc))
      activations.push(activation)
    }

    const output = activation.to1DArray()
    const confidence = this.calculateConfidence(output)
    const probability = Math.max(...output)
    
    // Analiza predictiei
    const analysis = this.analyzePrediction(output, confidence)
    
    const endTime = performance.now()
    const microsecondTimestamp = endTime * 1000

    return {
      prediction: output,
      confidence,
      probability,
      analysis,
      microsecondTimestamp
    }
  }

  private calculateConfidence(output: number[]): number {
    if (output.length === 1) {
      // Pentru regresie
      return Math.min(0.95, Math.max(0.05, Math.abs(output[0])))
    } else {
      // Pentru clasificare - entropia
      const entropy = -output.reduce((sum, p) => {
        return sum + (p > 0 ? p * Math.log2(p) : 0)
      }, 0)
      const maxEntropy = Math.log2(output.length)
      return 1 - (entropy / maxEntropy)
    }
  }

  private analyzePrediction(output: number[], confidence: number): PredictionResult['analysis'] {
    const prediction = output[0] // Assuming price prediction
    
    let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral'
    if (prediction > 0.6) trend = 'bullish'
    else if (prediction < 0.4) trend = 'bearish'
    
    const strength = Math.abs(prediction - 0.5) * 2 // 0-1 scale
    
    let risk: 'low' | 'medium' | 'high' = 'medium'
    if (confidence > 0.8 && strength > 0.7) risk = 'low'
    else if (confidence < 0.5 || strength < 0.3) risk = 'high'
    
    return {
      trend,
      strength,
      timeframe: this.determineTimeframe(strength),
      risk
    }
  }

  private determineTimeframe(strength: number): string {
    if (strength > 0.8) return '15m-1h'
    else if (strength > 0.5) return '1h-4h'
    else return '4h-1d'
  }

  async train(data: TrainingData): Promise<void> {
    const { inputs, targets, validation } = data
    const { epochs, batchSize, learningRate } = this.config
    
    console.log('🧠 Starting Neural Network 2025 training...')
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0
      let correct = 0
      
      // Shuffle data
      const shuffledIndices = this.shuffleArray([...Array(inputs.length).keys()])
      
      // Mini-batch training
      for (let i = 0; i < inputs.length; i += batchSize) {
        const batchEnd = Math.min(i + batchSize, inputs.length)
        const batchIndices = shuffledIndices.slice(i, batchEnd)
        
        let batchLoss = 0
        const weightGradients: Matrix[] = this.weights.map(w => Matrix.zeros(w.rows, w.columns))
        const biasGradients: Matrix[] = this.biases.map(b => Matrix.zeros(b.rows, b.columns))
        
        // Process batch
        for (const idx of batchIndices) {
          const input = inputs[idx]
          const target = targets[idx]
          
          // Forward pass
          const { activations, loss, isCorrect } = this.forwardPass(input, target)
          batchLoss += loss
          if (isCorrect) correct++
          
          // Backward pass
          const { weightGrads, biasGrads } = this.backwardPass(activations, input, target)
          
          // Accumulate gradients
          for (let j = 0; j < weightGradients.length; j++) {
            weightGradients[j] = weightGradients[j].add(weightGrads[j])
            biasGradients[j] = biasGradients[j].add(biasGrads[j])
          }
        }
        
        // Update weights
        this.updateWeights(weightGradients, biasGradients, batchIndices.length, learningRate)
        totalLoss += batchLoss
      }
      
      const avgLoss = totalLoss / inputs.length
      const accuracy = correct / inputs.length
      
      // Validation
      let validationLoss: number | undefined
      let validationAccuracy: number | undefined
      
      if (validation) {
        const valResults = this.validateModel(validation.inputs, validation.targets)
        validationLoss = valResults.loss
        validationAccuracy = valResults.accuracy
      }
      
      // Store training history
      this.trainingHistory.push({
        epoch: epoch + 1,
        loss: avgLoss,
        accuracy,
        validationLoss,
        validationAccuracy
      })
      
      // Log progress
      if ((epoch + 1) % 10 === 0 || epoch === epochs - 1) {
        console.log(`Epoch ${epoch + 1}/${epochs} - Loss: ${avgLoss.toFixed(4)}, Accuracy: ${(accuracy * 100).toFixed(2)}%${validation ? `, Val Loss: ${validationLoss?.toFixed(4)}, Val Acc: ${(validationAccuracy! * 100).toFixed(2)}%` : ''}`)
      }
    }
    
    console.log('✅ Neural Network 2025 training completed!')
  }

  private forwardPass(input: number[], target: number[]): { activations: Matrix[], loss: number, isCorrect: boolean } {
    let activation = new Matrix([input]).transpose()
    const activations: Matrix[] = [activation]

    // Forward pass through network
    for (let i = 0; i < this.weights.length; i++) {
      const z = this.weights[i].mmul(activation).add(this.biases[i])
      const isOutputLayer = i === this.weights.length - 1
      const activationFunc = isOutputLayer ? 'sigmoid' : this.config.activationFunction
      
      activation = z.apply((row, col, value) => this.activate(value, activationFunc))
      activations.push(activation)
    }

    // Calculate loss (MSE for regression)
    const output = activation.to1DArray()
    const loss = target.reduce((sum, t, i) => sum + Math.pow(t - output[i], 2), 0) / target.length
    
    // Check if prediction is correct (for classification)
    const predicted = output.indexOf(Math.max(...output))
    const actual = target.indexOf(Math.max(...target))
    const isCorrect = predicted === actual

    return { activations, loss, isCorrect }
  }

  private backwardPass(activations: Matrix[], input: number[], target: number[]): { weightGrads: Matrix[], biasGrads: Matrix[] } {
    const weightGrads: Matrix[] = []
    const biasGrads: Matrix[] = []
    
    // Output layer error
    const output = activations[activations.length - 1]
    const targetMatrix = new Matrix([target]).transpose()
    let delta = output.sub(targetMatrix) // For MSE loss with sigmoid
    
    // Backward pass through layers
    for (let i = this.weights.length - 1; i >= 0; i--) {
      const prevActivation = activations[i]
      
      // Calculate gradients
      const weightGrad = delta.mmul(prevActivation.transpose())
      const biasGrad = delta.clone()
      
      weightGrads.unshift(weightGrad)
      biasGrads.unshift(biasGrad)
      
      // Calculate delta for previous layer
      if (i > 0) {
        const weightTranspose = this.weights[i].transpose()
        delta = weightTranspose.mmul(delta)
        
        // Apply derivative of activation function
        const z = this.weights[i - 1].mmul(activations[i - 1]).add(this.biases[i - 1])
        const activationFunc = this.config.activationFunction
        
        delta = delta.mul(z.apply((row, col, value) => this.activateDerivative(value, activationFunc)))
      }
    }
    
    return { weightGrads, biasGrads }
  }

  private updateWeights(weightGrads: Matrix[], biasGrads: Matrix[], batchSize: number, learningRate: number): void {
    if (this.config.optimizer === 'adam' && this.adamParams) {
      this.adamOptimizer(weightGrads, biasGrads, batchSize, learningRate)
    } else {
      // Simple SGD
      for (let i = 0; i < this.weights.length; i++) {
        const avgWeightGrad = weightGrads[i].div(batchSize)
        const avgBiasGrad = biasGrads[i].div(batchSize)
        
        this.weights[i] = this.weights[i].sub(avgWeightGrad.mul(learningRate))
        this.biases[i] = this.biases[i].sub(avgBiasGrad.mul(learningRate))
      }
    }
  }

  private adamOptimizer(weightGrads: Matrix[], biasGrads: Matrix[], batchSize: number, learningRate: number): void {
    if (!this.adamParams) return
    
    const { m, v, beta1, beta2, epsilon } = this.adamParams
    
    for (let i = 0; i < this.weights.length; i++) {
      const avgWeightGrad = weightGrads[i].div(batchSize)
      
      // Update biased first moment estimate
      m[i] = m[i].mul(beta1).add(avgWeightGrad.mul(1 - beta1))
      
      // Update biased second raw moment estimate
      v[i] = v[i].mul(beta2).add(avgWeightGrad.mul(avgWeightGrad).mul(1 - beta2))
      
      // Compute bias-corrected first moment estimate
      const mCorrected = m[i].div(1 - Math.pow(beta1, this.trainingHistory.length + 1))
      
      // Compute bias-corrected second raw moment estimate
      const vCorrected = v[i].div(1 - Math.pow(beta2, this.trainingHistory.length + 1))
      
      // Update weights
      const denominator = vCorrected.apply((r, c, val) => Math.sqrt(val) + epsilon)
      const update = mCorrected.div(denominator).mul(learningRate)
      
      this.weights[i] = this.weights[i].sub(update)
    }
  }

  private validateModel(inputs: number[][], targets: number[][]): { loss: number, accuracy: number } {
    let totalLoss = 0
    let correct = 0
    
    for (let i = 0; i < inputs.length; i++) {
      const prediction = this.predict(inputs[i])
      const target = targets[i]
      
      // Calculate loss
      const loss = target.reduce((sum, t, j) => sum + Math.pow(t - prediction.prediction[j], 2), 0) / target.length
      totalLoss += loss
      
      // Check accuracy
      const predicted = prediction.prediction.indexOf(Math.max(...prediction.prediction))
      const actual = target.indexOf(Math.max(...target))
      if (predicted === actual) correct++
    }
    
    return {
      loss: totalLoss / inputs.length,
      accuracy: correct / inputs.length
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Public methods for model management
  getTrainingHistory() {
    return this.trainingHistory
  }

  getModelInfo() {
    return {
      config: this.config,
      layers: [this.config.inputSize, ...this.config.hiddenLayers, this.config.outputSize],
      parameters: this.weights.reduce((sum, w) => sum + w.rows * w.columns, 0) + this.biases.reduce((sum, b) => sum + b.rows, 0),
      trainingEpochs: this.trainingHistory.length
    }
  }

  exportModel(): any {
    return {
      config: this.config,
      weights: this.weights.map(w => w.to2DArray()),
      biases: this.biases.map(b => b.to2DArray()),
      trainingHistory: this.trainingHistory
    }
  }

  static importModel(modelData: any): NeuralNetwork2025 {
    const nn = new NeuralNetwork2025(modelData.config)
    nn.weights = modelData.weights.map((w: number[][]) => new Matrix(w))
    nn.biases = modelData.biases.map((b: number[][]) => new Matrix(b))
    nn.trainingHistory = modelData.trainingHistory || []
    return nn
  }
}

// Factory functions pentru modele pre-configurate
export class ModelFactory2025 {
  static createPricePredictionModel(): NeuralNetwork2025 {
    return new NeuralNetwork2025({
      inputSize: 20, // 20 features (OHLCV + indicatori tehnici)
      hiddenLayers: [64, 32, 16],
      outputSize: 3, // Bullish, Bearish, Neutral
      activationFunction: 'swish',
      learningRate: 0.001,
      epochs: 100,
      batchSize: 32,
      regularization: {
        l2: 0.01,
        dropout: 0.1
      },
      optimizer: 'adam'
    })
  }

  static createVolatilityModel(): NeuralNetwork2025 {
    return new NeuralNetwork2025({
      inputSize: 15, // Features pentru volatilitate
      hiddenLayers: [32, 16],
      outputSize: 1, // Nivelul de volatilitate
      activationFunction: 'relu',
      learningRate: 0.002,
      epochs: 150,
      batchSize: 16,
      optimizer: 'adam'
    })
  }

  static createSentimentModel(): NeuralNetwork2025 {
    return new NeuralNetwork2025({
      inputSize: 100, // Word embeddings
      hiddenLayers: [128, 64, 32],
      outputSize: 3, // Positive, Negative, Neutral
      activationFunction: 'tanh',
      learningRate: 0.001,
      epochs: 200,
      batchSize: 64,
      regularization: {
        dropout: 0.2
      },
      optimizer: 'adam'
    })
  }
}