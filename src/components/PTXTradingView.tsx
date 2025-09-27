'use client';

import React, { useState, useEffect } from 'react';
import { AdvancedChart, CryptocurrencyMarket } from 'react-tradingview-embed';
import { AccessLevel } from '../types/ptx';
import { PTX_TOKEN_CONFIG, ACCESS_LEVELS, FOUR_MEME_CONFIG } from '../lib/ptx-config';
import PTXVerification from './PTXVerification';

interface PTXTradingViewProps {
  userVerified?: boolean;
  accessLevel?: AccessLevel;
  showVerification?: boolean;
}

export default function PTXTradingView({ 
  userVerified = false,
  accessLevel = 'none',
  showVerification = true
}: PTXTradingViewProps) {
  const [isVerified, setIsVerified] = useState(userVerified);
  const [currentAccessLevel, setCurrentAccessLevel] = useState<AccessLevel>(accessLevel);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    setIsVerified(userVerified);
    setCurrentAccessLevel(accessLevel);
  }, [userVerified, accessLevel]);

  const handleVerificationChange = (verified: boolean, level: AccessLevel) => {
    setIsVerified(verified);
    setCurrentAccessLevel(level);
    if (verified) {
      // Delay chart rendering to ensure smooth transition
      setTimeout(() => setShowChart(true), 500);
    } else {
      setShowChart(false);
    }
  };

  const getChartConfig = () => {
    const baseConfig = {
      width: '100%',
      height: 500,
      theme: 'dark' as const,
      hide_top_toolbar: false,
      allow_symbol_change: false,
      save_image: false,
      container_id: 'ptx-tradingview-chart',
    };

    // Configure chart based on access level
    switch (currentAccessLevel) {
      case 'premium':
        return {
          ...baseConfig,
          symbol: `BSC:${PTX_TOKEN_CONFIG.contractAddress}`,
          interval: '5',
          studies: ['RSI', 'MACD', 'BB', 'SAR', 'EMA'],
          hide_top_toolbar: false,
          allow_symbol_change: true,
          save_image: true,
        };
      case 'advanced':
        return {
          ...baseConfig,
          symbol: `BSC:${PTX_TOKEN_CONFIG.contractAddress}`,
          interval: '15',
          studies: ['RSI', 'MACD', 'BB'],
          hide_top_toolbar: false,
        };
      case 'basic':
        return {
          ...baseConfig,
          symbol: `BSC:${PTX_TOKEN_CONFIG.contractAddress}`,
          interval: '1H',
          studies: ['RSI'],
          hide_top_toolbar: true,
        };
      default:
        return {
          ...baseConfig,
          symbol: 'BINANCE:BNBUSDT', // Show BNB instead of PTX for non-holders
          interval: '1D',
          studies: [],
          hide_top_toolbar: true,
        };
    }
  };

  const accessConfig = ACCESS_LEVELS[currentAccessLevel];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span>📈</span>
            <span>PTX Trading Dashboard</span>
          </h2>
          <p className="text-gray-400 mt-1">
            {isVerified 
              ? `${accessConfig.description} - ${accessConfig.features.length} features unlocked`
              : 'Connect wallet and verify PTX holdings to access trading features'
            }
          </p>
        </div>
        
        {isVerified && (
          <div className="flex items-center space-x-2">
            <div 
              className="px-3 py-1 rounded-full text-sm font-semibold capitalize"
              style={{ 
                backgroundColor: `${accessConfig.color}20`,
                color: accessConfig.color,
                border: `1px solid ${accessConfig.color}40`
              }}
            >
              {currentAccessLevel} Access
            </div>
          </div>
        )}
      </div>

      {/* Verification Section */}
      {showVerification && !isVerified && (
        <PTXVerification 
          onVerificationComplete={handleVerificationChange}
          showMyShellLink={true}
        />
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* TradingView Chart */}
        <div className="xl:col-span-2">
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {isVerified ? 'PTX Price Chart' : 'Sample Chart (BNB/USDT)'}
              </h3>
              
              {isVerified && (
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live Data</span>
                </div>
              )}
            </div>
            
            <div className="relative">
              {(!isVerified || !showChart) && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🔒</div>
                    <h4 className="text-xl font-semibold text-white mb-2">
                      PTX Holder Verification Required
                    </h4>
                    <p className="text-gray-400">
                      Verify your PTX holdings to access the live trading chart
                    </p>
                  </div>
                </div>
              )}
              
              <div className={!isVerified || !showChart ? 'opacity-30' : 'opacity-100'}>
                <AdvancedChart widgetProps={getChartConfig()} />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Token Info */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4">PTX Token Info</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Contract:</span>
                <a 
                  href={`https://bscscan.com/address/${PTX_TOKEN_CONFIG.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm font-mono"
                >
                  {PTX_TOKEN_CONFIG.contractAddress.slice(0, 8)}...
                </a>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Symbol:</span>
                <span className="text-white font-semibold">{PTX_TOKEN_CONFIG.symbol}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Network:</span>
                <span className="text-yellow-400">BNB Chain</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Min. Holding:</span>
                <span className="text-green-400">{PTX_TOKEN_CONFIG.minHoldingRequired} PTX</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-700">
              <a 
                href={FOUR_MEME_CONFIG.tokenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
              >
                <span>🚀</span>
                <span>View on Four.meme</span>
              </a>
            </div>
          </div>

          {/* Access Levels */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Access Levels</h3>
            
            <div className="space-y-3">
              {Object.values(ACCESS_LEVELS).filter(level => level.level !== 'none').map((level) => (
                <div 
                  key={level.level}
                  className={`border rounded-lg p-3 transition-all duration-200 ${
                    currentAccessLevel === level.level 
                      ? 'border-current bg-current/10' 
                      : 'border-gray-600 bg-gray-800/30'
                  }`}
                  style={{ 
                    borderColor: currentAccessLevel === level.level ? level.color : undefined,
                    color: currentAccessLevel === level.level ? level.color : undefined
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold capitalize">{level.level}</span>
                    <span className="text-sm">
                      {level.minTokens.toLocaleString()} PTX+
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    {level.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        <span>•</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                    {level.features.length > 3 && (
                      <div className="text-xs mt-1 opacity-70">
                        +{level.features.length - 3} more features
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crypto Market Overview */}
          {isVerified && currentAccessLevel !== 'none' && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Crypto Market</h3>
              <CryptocurrencyMarket
                widgetProps={{
                  width: '100%',
                  height: 300,
                  defaultColumn: 'overview',
                  screener_type: 'crypto_mkt',
                  displayCurrency: 'USD',
                  colorTheme: 'dark',
                }}
                />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}