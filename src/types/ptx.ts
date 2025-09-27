// PTX Token Verification System Types
export interface PTXTokenConfig {
  contractAddress: string;
  chainId: number;
  decimals: number;
  symbol: string;
  name: string;
  minHoldingRequired: string;
}

export interface PTXVerificationResult {
  isHolder: boolean;
  balance: string;
  balanceFormatted: string;
  accessLevel: AccessLevel;
  verified: boolean;
  timestamp: number;
  error?: string;
}

export interface PTXAccessToken {
  wallet: string;
  ptxBalance: string;
  accessLevel: AccessLevel;
  verified: boolean;
  timestamp: number;
  expiresAt: number;
}

export type AccessLevel = 'none' | 'basic' | 'advanced' | 'premium';

export interface PTXAccessLevelConfig {
  level: AccessLevel;
  minTokens: number;
  features: string[];
  description: string;
  color: string;
}

export interface MyShellIntegration {
  agentUrl: string;
  profileUrl: string;
  launchpadUrl: string;
  webhookUrl?: string;
}

export interface VerificationRequest {
  walletAddress: string;
  signature: string;
  message: string;
  timestamp: number;
}

export interface VerificationResponse {
  success: boolean;
  accessToken?: string;
  ptxBalance?: string;
  accessLevel?: AccessLevel;
  error?: string;
  myshellAccess?: {
    agentUrl: string;
    hasAccess: boolean;
  };
}

export interface PTXDashboardProps {
  userVerified: boolean;
  ptxBalance: string;
  accessLevel: AccessLevel;
  onVerificationChange: (verified: boolean) => void;
}

// Four.meme Integration Types
export interface FourMemeTokenData {
  address: string;
  name: string;
  symbol: string;
  totalSupply: string;
  marketCap: number;
  liquidity: number;
  bondingCurveProgress: number;
  isGraduated: boolean;
}

// TradingView Integration Types
export interface PTXTradingViewConfig {
  symbol: string;
  contractAddress: string;
  theme: 'light' | 'dark';
  interval: string;
  studies: string[];
  height: number;
  showAccessControl: boolean;
}