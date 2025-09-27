'use client';

import { useState, useEffect, useCallback } from 'react';
import { PTXVerificationResult, AccessLevel } from '../types/ptx';
import { PTXVerificationService } from '../services/ptx-verification';
import { VERIFICATION_MESSAGES } from '../lib/ptx-config';

export interface UsePTXVerificationReturn {
  isVerified: boolean;
  accessLevel: AccessLevel;
  ptxBalance: string;
  walletAddress: string | null;
  isLoading: boolean;
  error: string | null;
  verificationResult: PTXVerificationResult | null;
  
  // Actions
  connectWallet: () => Promise<void>;
  verifyPTXHoldings: () => Promise<void>;
  disconnect: () => void;
  refreshVerification: () => Promise<void>;
  clearError: () => void;
}

export function usePTXVerification(): UsePTXVerificationReturn {
  const [isVerified, setIsVerified] = useState(false);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('none');
  const [ptxBalance, setPtxBalance] = useState('0');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<PTXVerificationResult | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const verificationService = new PTXVerificationService();

  // Load saved verification on mount
  useEffect(() => {
    const loadSavedVerification = async () => {
      try {
        const savedToken = localStorage.getItem('ptx_access_token');
        if (!savedToken) return;

        const decoded = verificationService.verifyAccessToken(savedToken);
        if (!decoded || decoded.expiresAt <= Date.now()) {
          localStorage.removeItem('ptx_access_token');
          return;
        }

        // Check if token needs refresh
        if (verificationService.shouldRefreshToken(decoded)) {
          const refreshResult = await verificationService.refreshAccessToken(decoded);
          if (refreshResult.success && refreshResult.accessToken) {
            localStorage.setItem('ptx_access_token', refreshResult.accessToken);
            setAccessToken(refreshResult.accessToken);
            setPtxBalance(refreshResult.ptxBalance || '0');
            setAccessLevel(refreshResult.accessLevel || 'none');
          } else {
            localStorage.removeItem('ptx_access_token');
            return;
          }
        } else {
          setAccessToken(savedToken);
          setPtxBalance(decoded.ptxBalance);
          setAccessLevel(decoded.accessLevel);
        }

        setWalletAddress(decoded.wallet);
        setIsVerified(true);
        
        setVerificationResult({
          isHolder: true,
          balance: '0',
          balanceFormatted: decoded.ptxBalance,
          accessLevel: decoded.accessLevel,
          verified: true,
          timestamp: decoded.timestamp,
        });
      } catch (error) {
        console.error('Failed to load saved verification:', error);
        localStorage.removeItem('ptx_access_token');
      }
    };

    loadSavedVerification();
  }, []);

  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('MetaMask not detected. Please install MetaMask to continue.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      } else {
        throw new Error('No accounts found');
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyPTXHoldings = useCallback(async () => {
    if (!walletAddress) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const timestamp = Date.now();
      const message = VERIFICATION_MESSAGES.signMessage(timestamp);
      const signature = await signer.signMessage(message);
      
      const response = await verificationService.completeVerification({
        walletAddress,
        signature,
        message,
        timestamp,
      });

      if (response.success && response.accessToken) {
        localStorage.setItem('ptx_access_token', response.accessToken);
        setAccessToken(response.accessToken);
        setPtxBalance(response.ptxBalance || '0');
        setAccessLevel(response.accessLevel || 'none');
        setIsVerified(true);
        
        setVerificationResult({
          isHolder: true,
          balance: '0',
          balanceFormatted: response.ptxBalance || '0',
          accessLevel: response.accessLevel || 'none',
          verified: true,
          timestamp: Date.now(),
        });
      } else {
        setError(response.error || VERIFICATION_MESSAGES.verificationFailed);
      }
    } catch (error) {
      console.error('PTX verification failed:', error);
      setError(error instanceof Error ? error.message : VERIFICATION_MESSAGES.verificationFailed);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  const refreshVerification = useCallback(async () => {
    if (!accessToken) {
      setError('No active verification to refresh');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const decoded = verificationService.verifyAccessToken(accessToken);
      if (!decoded) {
        throw new Error('Invalid access token');
      }

      const refreshResult = await verificationService.refreshAccessToken(decoded);
      
      if (refreshResult.success && refreshResult.accessToken) {
        localStorage.setItem('ptx_access_token', refreshResult.accessToken);
        setAccessToken(refreshResult.accessToken);
        setPtxBalance(refreshResult.ptxBalance || '0');
        setAccessLevel(refreshResult.accessLevel || 'none');
        
        setVerificationResult({
          isHolder: true,
          balance: '0',
          balanceFormatted: refreshResult.ptxBalance || '0',
          accessLevel: refreshResult.accessLevel || 'none',
          verified: true,
          timestamp: Date.now(),
        });
      } else {
        // Verification failed, clear everything
        disconnect();
        setError(refreshResult.error || 'Failed to refresh verification');
      }
    } catch (error) {
      console.error('Failed to refresh verification:', error);
      disconnect();
      setError('Failed to refresh verification');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  const disconnect = useCallback(() => {
    setIsVerified(false);
    setAccessLevel('none');
    setPtxBalance('0');
    setWalletAddress(null);
    setVerificationResult(null);
    setAccessToken(null);
    setError(null);
    localStorage.removeItem('ptx_access_token');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isVerified,
    accessLevel,
    ptxBalance,
    walletAddress,
    isLoading,
    error,
    verificationResult,
    
    connectWallet,
    verifyPTXHoldings,
    disconnect,
    refreshVerification,
    clearError,
  };
}