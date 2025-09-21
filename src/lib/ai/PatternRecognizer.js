/**
 * PatternRecognizer.js - CNN-based chart pattern recognition for ProfessorXTrader
 * Detects candlestick and microstructure patterns using TensorFlow.js
 */
import * as tf from '@tensorflow/tfjs';

class PatternRecognizer {
  constructor(options = {}) {
    this.inputLength = options.inputLength || 128; // timesteps
    this.channels = options.channels || 3; // e.g., OHLC encoded channels
    this.numClasses = options.numClasses || 6; // e.g., head_and_shoulders, double_top, wedge, triangle, cup_handle, none
    this.model = null;
  }

  buildModel() {
    const input = tf.input({ shape: [this.inputLength, this.channels] });
    let x = tf.layers.conv1d({ filters: 32, kernelSize: 5, activation: 'relu', padding: 'same' }).apply(input);
    x = tf.layers.batchNormalization().apply(x);
    x = tf.layers.maxPooling1d({ poolSize: 2 }).apply(x);

    x = tf.layers.conv1d({ filters: 64, kernelSize: 5, activation: 'relu', padding: 'same' }).apply(x);
    x = tf.layers.batchNormalization().apply(x);
    x = tf.layers.maxPooling1d({ poolSize: 2 }).apply(x);

    x = tf.layers.conv1d({ filters: 128, kernelSize: 3, activation: 'relu', padding: 'same' }).apply(x);
    x = tf.layers.globalAveragePooling1d().apply(x);
    x = tf.layers.dropout({ rate: 0.3 }).apply(x);

    const output = tf.layers.dense({ units: this.numClasses, activation: 'softmax' }).apply(x);
    const model = tf.model({ inputs: input, outputs: output });
    model.compile({ optimizer: tf.train.adam(1e-3), loss: 'categoricalCrossentropy', metrics: ['accuracy'] });
    this.model = model;
    return model;
  }

  encodeOHLC(ohlc) {
    // Simple normalization and channelization
    const closes = ohlc.map(r => r[3]);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const scale = max === min ? 1 : (max - min);
    return ohlc.map(([o,h,l,c]) => [
      (o - min) / scale,
      (h - min) / scale,
      (l - min) / scale,
      // Only use three channels: body and wicks combined
      // Channel 0: normalized close
      // Channel 1: normalized high-low range
      // Channel 2: normalized open-close body
    ]);
  }

  async train(X, y, epochs = 10, batchSize = 32) {
    if (!this.model) this.buildModel();
    const Xt = tf.tensor3d(X); // [N, T, C]
    const yt = tf.tensor2d(y); // one-hot labels [N, numClasses]
    const hist = await this.model.fit(Xt, yt, { epochs, batchSize, shuffle: true, validationSplit: 0.1 });
    Xt.dispose();
    yt.dispose();
    return hist.history;
  }

  async predict(window) {
    if (!this.model) this.buildModel();
    const t = tf.tensor3d([window]);
    const out = this.model.predict(t);
    const data = await out.data();
    t.dispose();
    out.dispose();
    // Return class index and probabilities
    const probs = Array.from(data);
    const idx = probs.indexOf(Math.max(...probs));
    return { classIndex: idx, probs };
  }

  dispose() {
    if (this.model) this.model.dispose();
    this.model = null;
  }
}

export default PatternRecognizer;
