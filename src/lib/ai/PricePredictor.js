/**
 * PricePredictor.js - LSTM-based price prediction for ProfessorXTrader
 * Uses TensorFlow.js to build, train, and run an LSTM model over OHLCV series
 */
import * as tf from '@tensorflow/tfjs';

class PricePredictor {
  constructor(options = {}) {
    this.lookback = options.lookback || 60; // timesteps
    this.features = options.features || 5; // o,h,l,c,v
    this.hiddenUnits = options.hiddenUnits || 64;
    this.dropout = options.dropout || 0.2;
    this.learningRate = options.learningRate || 1e-3;
    this.model = null;
    this.scaler = { min: null, max: null };
    this.isInitialized = false;
  }

  buildModel() {
    const m = tf.sequential();
    m.add(tf.layers.lstm({ units: this.hiddenUnits, returnSequences: true, inputShape: [this.lookback, this.features] }));
    m.add(tf.layers.dropout({ rate: this.dropout }));
    m.add(tf.layers.lstm({ units: Math.floor(this.hiddenUnits / 2) }));
    m.add(tf.layers.dropout({ rate: this.dropout }));
    m.add(tf.layers.dense({ units: 1 })); // next close price
    m.compile({ optimizer: tf.train.adam(this.learningRate), loss: 'meanSquaredError', metrics: ['mse'] });
    this.model = m;
    this.isInitialized = true;
    return m;
  }

  fitScaler(series) {
    const flat = series.flat(2);
    const min = Math.min(...flat);
    const max = Math.max(...flat);
    this.scaler = { min, max };
  }

  scale(x) {
    const { min, max } = this.scaler;
    if (min === null || max === null || max === min) return x;
    return x.map(row => row.map(vals => vals.map(v => (v - min) / (max - min))));
  }

  descaleValue(v) {
    const { min, max } = this.scaler;
    if (min === null || max === null || max === min) return v;
    return v * (max - min) + min;
  }

  makeWindows(ohlcv) {
    // ohlcv: array of [o,h,l,c,v]
    const X = [], y = [];
    for (let i = this.lookback; i < ohlcv.length; i++) {
      const window = ohlcv.slice(i - this.lookback, i); // shape lookback x 5
      const nextClose = ohlcv[i][3];
      X.push(window);
      y.push(nextClose);
    }
    return { X, y };
  }

  async train(ohlcv, epochs = 10, batchSize = 32, onEpochEnd) {
    if (!this.model) this.buildModel();
    const { X, y } = this.makeWindows(ohlcv);
    this.fitScaler(X);
    const Xs = this.scale(X);
    const Xtensor = tf.tensor3d(Xs);
    const ytensor = tf.tensor1d(y);

    const history = await this.model.fit(Xtensor, ytensor, {
      epochs,
      batchSize,
      shuffle: true,
      validationSplit: 0.1,
      callbacks: onEpochEnd ? { onEpochEnd } : undefined,
    });

    Xtensor.dispose();
    ytensor.dispose();
    return history.history;
  }

  async predictNext(ohlcv) {
    if (!this.model) this.buildModel();
    if (ohlcv.length < this.lookback) throw new Error('Not enough data for prediction');
    const lastWindow = [ohlcv.slice(-this.lookback)]; // 1 x lookback x 5
    const scaled = this.scale(lastWindow);
    const X = tf.tensor3d(scaled);
    const out = this.model.predict(X);
    const arr = await out.data();
    X.dispose();
    out.dispose();
    return this.descaleValue(arr[0]);
  }

  dispose() {
    if (this.model) this.model.dispose();
    this.model = null;
    this.isInitialized = false;
  }
}

export default PricePredictor;
