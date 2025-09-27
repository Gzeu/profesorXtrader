import { PTXTokenConfig, PTXAccessLevelConfig, MyShellIntegration } from '../types/ptx';

// PTX Token Configuration
export const PTX_TOKEN_CONFIG: PTXTokenConfig = {
  contractAddress: '0x250e421e4c17c8f47d92d31a8ee3d60c08814444',
  chainId: 56, // BNB Chain
  decimals: 18,
  symbol: 'PTX',
  name: 'ProfesorXtrader',
  minHoldingRequired: '1000', // 1000 PTX minimum
};

// BNB Chain RPC Configuration
export const BSC_RPC_URLS = [
  'https://bsc-dataseed.binance.org/',
  'https://bsc-dataseed1.defibit.io/',
  'https://bsc-dataseed1.ninicoin.io/',
  'https://bsc-dataseed2.defibit.io/',
];

// Access Levels Configuration
export const ACCESS_LEVELS: Record<string, PTXAccessLevelConfig> = {
  none: {
    level: 'none',
    minTokens: 0,
    features: [],
    description: 'No access - insufficient PTX balance',
    color: '#6B7280',
  },
  basic: {
    level: 'basic',
    minTokens: 1000,
    features: [
      'MyShell Agent Access',
      'Basic Trading Dashboard',
      'PTX Price Tracking',
      'Community Access',
    ],
    description: 'Basic access for PTX holders',
    color: '#10B981',
  },
  advanced: {
    level: 'advanced',
    minTokens: 10000,
    features: [
      'MyShell Agent Access',
      'Advanced Trading Dashboard',
      'PTX Price Tracking',
      'Community Access',
      'Advanced Trading Signals',
      'Portfolio Analytics',
      'Risk Management Tools',
    ],
    description: 'Advanced features for larger PTX holders',
    color: '#3B82F6',
  },
  premium: {
    level: 'premium',
    minTokens: 100000,
    features: [
      'MyShell Agent Access',
      'Premium Trading Dashboard',
      'PTX Price Tracking',
      'Community Access',
      'Advanced Trading Signals',
      'Portfolio Analytics',
      'Risk Management Tools',
      'Priority Support',
      'Exclusive Features',
      'Early Access to New Tools',
    ],
    description: 'Premium access with exclusive features',
    color: '#F59E0B',
  },
};

// MyShell Integration Configuration
export const MYSHELL_CONFIG: MyShellIntegration = {
  agentUrl: 'https://app.myshell.ai/explore/profile/04c96459b2b64890b3ed48394fcb8aa4?nametag=%239600&invite=512a4e',
  profileUrl: 'https://app.myshell.ai/explore/profile/04c96459b2b64890b3ed48394fcb8aa4?nametag=%239600&invite=512a4e',
  launchpadUrl: 'https://launch.myshell.ai/shell-launchpad/0x250e421e4c17c8f47d92d31a8ee3d60c08814444',
};

// Four.meme Integration
export const FOUR_MEME_CONFIG = {
  tokenUrl: 'https://four.meme/token/0x250e421e4c17c8f47d92d31a8ee3d60c08814444?code=R37N2GDKSENU',
  apiBaseUrl: 'https://api.four.meme',
  exchangeContract: '0x5c952063c7fc8610FFDB798152D69F0B9550762b',
  protocolName: 'fourmeme_v1',
};

// JWT Configuration
export const JWT_CONFIG = {
  expiresIn: '24h',
  refreshThreshold: 3600000, // 1 hour in milliseconds
  issuer: 'profesorxtrader',
};

// Verification Messages
export const VERIFICATION_MESSAGES = {
  signMessage: (timestamp: number) => `Verify PTX holder: ${timestamp}`,
  welcome: 'Welcome, verified PTX holder!',
  accessDenied: 'Access denied: Insufficient PTX balance',
  verificationFailed: 'Verification failed. Please try again.',
  connectionRequired: 'Please connect your wallet to verify PTX holdings',
};

// Helper function to get access level from balance
export const getAccessLevel = (balance: number): PTXAccessLevelConfig => {
  if (balance >= ACCESS_LEVELS.premium.minTokens) {
    return ACCESS_LEVELS.premium;
  }
  if (balance >= ACCESS_LEVELS.advanced.minTokens) {
    return ACCESS_LEVELS.advanced;
  }
  if (balance >= ACCESS_LEVELS.basic.minTokens) {
    return ACCESS_LEVELS.basic;
  }
  return ACCESS_LEVELS.none;
};

// Helper function to format PTX balance
export const formatPTXBalance = (balance: string): string => {
  const balanceNum = parseFloat(balance);
  if (balanceNum >= 1000000) {
    return `${(balanceNum / 1000000).toFixed(2)}M PTX`;
  }
  if (balanceNum >= 1000) {
    return `${(balanceNum / 1000).toFixed(2)}K PTX`;
  }
  return `${balanceNum.toFixed(2)} PTX`;
};

// Contract ABI for PTX token
export const PTX_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function decimals() view returns (uint8)',
] as const;