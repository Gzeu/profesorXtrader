'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { 
  PTXVerificationResult, 
  AccessLevel, 
  PTXDashboardProps 
} from '../types/ptx';
import { 
  PTX_TOKEN_CONFIG,
  ACCESS_LEVELS,
  MYSHELL_CONFIG,
  VERIFICATION_MESSAGES,
  formatPTXBalance
} from '../lib/ptx-config';
import { PTXVerificationService } from '../services/ptx-verification';

interface PTXVerificationProps {
  onVerificationComplete?: (verified: boolean, accessLevel: AccessLevel) => void;
  showMyShellLink?: boolean;
}

export default function PTXVerification({ 
  onVerificationComplete,
  showMyShellLink = true 
}: PTXVerificationProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<PTXVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const verificationService = new PTXVerificationService();

  // Check for existing verification on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('ptx_access_token');
    if (savedToken) {
      const decoded = verificationService.verifyAccessToken(savedToken);
      if (decoded && decoded.expiresAt > Date.now()) {
        setAccessToken(savedToken);
        setWalletAddress(decoded.wallet);
        setVerificationResult({
          isHolder: true,
          balance: '0', // Will be refreshed
          balanceFormatted: decoded.ptxBalance,
          accessLevel: decoded.accessLevel,
          verified: true,
          timestamp: decoded.timestamp,
        });
        onVerificationComplete?.(true, decoded.accessLevel);
      } else {
        localStorage.removeItem('ptx_access_token');
      }
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('MetaMask not detected. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const verifyPTXHoldings = useCallback(async () => {
    if (!walletAddress || typeof window === 'undefined' || !window.ethereum) {
      setError('Wallet not connected');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Create verification message
      const timestamp = Date.now();
      const message = VERIFICATION_MESSAGES.signMessage(timestamp);
      
      // Request signature
      const signature = await signer.signMessage(message);
      
      // Complete verification
      const response = await verificationService.completeVerification({
        walletAddress,
        signature,
        message,
        timestamp,
      });

      if (response.success && response.accessToken) {
        // Store access token
        localStorage.setItem('ptx_access_token', response.accessToken);
        setAccessToken(response.accessToken);
        
        const result: PTXVerificationResult = {
          isHolder: true,
          balance: '0', // Service handles internal balance
          balanceFormatted: response.ptxBalance || '0',
          accessLevel: response.accessLevel || 'none',
          verified: true,
          timestamp: Date.now(),
        };
        
        setVerificationResult(result);
        onVerificationComplete?.(true, result.accessLevel);
      } else {
        setError(response.error || VERIFICATION_MESSAGES.verificationFailed);
        onVerificationComplete?.(false, 'none');
      }
    } catch (error) {
      console.error('PTX verification failed:', error);
      setError(error instanceof Error ? error.message : VERIFICATION_MESSAGES.verificationFailed);
      onVerificationComplete?.(false, 'none');
    } finally {
      setIsVerifying(false);
    }
  }, [walletAddress, onVerificationComplete]);

  const disconnect = useCallback(() => {
    setWalletAddress(null);
    setVerificationResult(null);
    setAccessToken(null);
    setError(null);
    localStorage.removeItem('ptx_access_token');
    onVerificationComplete?.(false, 'none');
  }, [onVerificationComplete]);

  const openMyShellAgent = useCallback(() => {
    window.open(MYSHELL_CONFIG.agentUrl, '_blank', 'noopener,noreferrer');
  }, []);

  if (verificationResult?.verified && accessToken) {
    const accessConfig = ACCESS_LEVELS[verificationResult.accessLevel];
    
    return (
      <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="text-lg font-semibold text-green-400">
              ✅ Verified PTX Holder
            </h3>
          </div>
          <button
            onClick={disconnect}
            className="text-red-400 hover:text-red-300 text-sm underline"
          >
            Disconnect
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">PTX Balance</div>
            <div className="text-xl font-bold text-white">
              {formatPTXBalance(verificationResult.balanceFormatted)}
            </div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Access Level</div>
            <div 
              className="text-xl font-bold capitalize"
              style={{ color: accessConfig.color }}
            >
              {verificationResult.accessLevel}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Available Features:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {accessConfig.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {showMyShellLink && (
          <div className="space-y-3">
            <button
              onClick={openMyShellAgent}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>🤖</span>
              <span>Access ProfesorXtrader Agent</span>
            </button>
            
            <div className="text-center text-sm text-gray-400">
              Connected: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-gray-900/50 to-blue-900/30 border border-gray-700 rounded-xl p-6">
      <div className="text-center">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white mb-2">
            🔐 PTX Token Holder Verification
          </h3>
          <p className="text-gray-400 text-sm">
            Connect your wallet and verify PTX holdings to access exclusive features
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">Minimum Required:</div>
          <div className="text-lg font-semibold text-yellow-400">
            {formatPTXBalance(PTX_TOKEN_CONFIG.minHoldingRequired)} PTX
          </div>
        </div>

        {!walletAddress ? (
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            {isConnecting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </div>
            ) : (
              '🔗 Connect Wallet'
            )}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-400">
              Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
            
            <button
              onClick={verifyPTXHoldings}
              disabled={isVerifying}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              {isVerifying ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying PTX Holdings...</span>
                </div>
              ) : (
                '🎯 Verify PTX Holdings'
              )}
            </button>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          Powered by BNB Chain • Contract: {PTX_TOKEN_CONFIG.contractAddress.slice(0, 10)}...
        </div>
      </div>
    </div>
  );
}