// AIAnalysis.js - Professional UI component for AI insights
// Displays sentiment summary, next price prediction, and pattern recognition results
import React from 'react';

export default function AIAnalysis({ data }) {
  if (!data) return null;
  const { sentiment, prediction, pattern } = data;

  return (
    <div className="ai-analysis card p-4 rounded-lg shadow border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">AI Market Analysis</h3>
        <span className="text-xs text-gray-500">{new Date(sentiment?.details?.[0]?.timestamp || Date.now()).toLocaleString()}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 rounded bg-gradient-to-br from-green-50 to-emerald-50 dark:from-emerald-900/20 dark:to-emerald-900/10">
          <div className="text-xs uppercase text-emerald-700 dark:text-emerald-300">Sentiment</div>
          <div className="mt-1 flex items-end gap-2">
            <div className="text-2xl font-bold">
              {sentiment?.label || 'neutral'}
            </div>
            <div className="text-sm text-gray-500">
              {(sentiment?.averageScore ?? 0).toFixed(2)} / conf {(sentiment?.averageConfidence ?? 0).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="p-3 rounded bg-gradient-to-br from-indigo-50 to-sky-50 dark:from-sky-900/20 dark:to-sky-900/10">
          <div className="text-xs uppercase text-sky-700 dark:text-sky-300">Next Price (LSTM)</div>
          <div className="mt-1 text-2xl font-bold">
            {prediction ? prediction.toFixed(4) : '—'}
          </div>
          <div className="text-xs text-gray-500">Predicted next close</div>
        </div>

        <div className="p-3 rounded bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10">
          <div className="text-xs uppercase text-orange-700 dark:text-orange-300">Pattern (CNN)</div>
          <div className="mt-1 text-2xl font-bold">
            {pattern ? `Class #${pattern.classIndex}` : '—'}
          </div>
          {!!pattern && (
            <div className="mt-1 text-xs text-gray-500">Top prob {(Math.max(...pattern.probs) || 0).toFixed(2)}</div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Method Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="p-3 rounded border border-gray-100 dark:border-gray-800">
            <div className="font-semibold mb-1">Sentiment Breakdown</div>
            <div className="space-y-1 max-h-32 overflow-auto pr-1">
              {(sentiment?.details || []).slice(0, 5).map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">{d.symbol}</span>
                  <span className="text-gray-900 dark:text-gray-100">{d.sentiment} ({d.score.toFixed(2)})</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 rounded border border-gray-100 dark:border-gray-800">
            <div className="font-semibold mb-1">LSTM Notes</div>
            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300">
              <li>Sequence modeling over OHLCV</li>
              <li>Normalized min-max scaling</li>
              <li>Validation split 10%</li>
            </ul>
          </div>
          <div className="p-3 rounded border border-gray-100 dark:border-gray-800">
            <div className="font-semibold mb-1">CNN Notes</div>
            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300">
              <li>1D Conv over encoded OHLC</li>
              <li>GlobalAvgPool + Softmax</li>
              <li>Top class and probabilities</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
