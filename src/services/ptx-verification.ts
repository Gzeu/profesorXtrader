import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import { 
  PTXVerificationResult, 
  PTXAccessToken, 
  VerificationRequest,
  VerificationResponse,
  AccessLevel 
} from '../types/ptx';
import { 
  PTX_TOKEN_CONFIG, 
  BSC_RPC_URLS, 
  PTX_ABI,
  getAccessLevel,
  formatPTXBalance,
  JWT_CONFIG,
  VERIFICATION_MESSAGES
} from '../lib/ptx-config';

export class PTXVerificationService {
  private provider: ethers.providers.JsonRpcProvider;
  private contract: ethers.Contract;
  private jwtSecret: string;

  constructor(jwtSecret?: string) {
    this.jwtSecret = jwtSecret || process.env.JWT_SECRET || 'ptx-verification-secret';
    this.initializeProvider();
  }

  private initializeProvider() {
    // Try multiple RPC endpoints for better reliability
    let providerInitialized = false;
    
    for (const rpcUrl of BSC_RPC_URLS) {
      try {
        this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        this.contract = new ethers.Contract(
          PTX_TOKEN_CONFIG.contractAddress,
          PTX_ABI,
          this.provider
        );
        providerInitialized = true;
        break;
      } catch (error) {
        console.warn(`Failed to initialize provider with ${rpcUrl}:`, error);
      }
    }

    if (!providerInitialized) {
      throw new Error('Failed to initialize any BNB Chain RPC provider');
    }
  }

  /**
   * Verify PTX token balance for a given wallet address
   */
  async verifyPTXBalance(walletAddress: string): Promise<PTXVerificationResult> {
    try {
      if (!ethers.utils.isAddress(walletAddress)) {
        throw new Error('Invalid wallet address format');
      }

      const balance = await this.contract.balanceOf(walletAddress);
      const balanceFormatted = ethers.utils.formatUnits(balance, PTX_TOKEN_CONFIG.decimals);
      const balanceNumber = parseFloat(balanceFormatted);
      
      const minRequired = parseFloat(PTX_TOKEN_CONFIG.minHoldingRequired);
      const isHolder = balanceNumber >= minRequired;
      const accessLevelConfig = getAccessLevel(balanceNumber);

      return {
        isHolder,
        balance: balance.toString(),
        balanceFormatted,
        accessLevel: accessLevelConfig.level,
        verified: true,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('PTX balance verification failed:', error);
      return {
        isHolder: false,
        balance: '0',
        balanceFormatted: '0',
        accessLevel: 'none',
        verified: false,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verify wallet ownership through signature
   */
  async verifyWalletSignature(
    walletAddress: string,
    message: string,
    signature: string
  ): Promise<boolean> {
    try {
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Complete verification process with signature and balance check
   */
  async completeVerification(
    request: VerificationRequest
  ): Promise<VerificationResponse> {
    try {
      // Verify signature
      const signatureValid = await this.verifyWalletSignature(
        request.walletAddress,
        request.message,
        request.signature
      );

      if (!signatureValid) {
        return {
          success: false,
          error: 'Invalid wallet signature',
        };
      }

      // Verify PTX balance
      const balanceVerification = await this.verifyPTXBalance(request.walletAddress);

      if (!balanceVerification.isHolder) {
        return {
          success: false,
          error: 'Insufficient PTX balance. Minimum required: ' + 
                 formatPTXBalance(PTX_TOKEN_CONFIG.minHoldingRequired),
        };
      }

      // Generate access token
      const accessToken = this.generateAccessToken({
        wallet: request.walletAddress,
        ptxBalance: balanceVerification.balanceFormatted,
        accessLevel: balanceVerification.accessLevel,
        verified: true,
        timestamp: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      });

      return {
        success: true,
        accessToken,
        ptxBalance: balanceVerification.balanceFormatted,
        accessLevel: balanceVerification.accessLevel,
        myshellAccess: {
          agentUrl: 'https://app.myshell.ai/chat/1758834706',
          hasAccess: true,
        },
      };
    } catch (error) {
      console.error('Complete verification failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  /**
   * Generate JWT access token
   */
  generateAccessToken(payload: PTXAccessToken): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: JWT_CONFIG.expiresIn,
      issuer: JWT_CONFIG.issuer,
    });
  }

  /**
   * Verify and decode access token
   */
  verifyAccessToken(token: string): PTXAccessToken | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: JWT_CONFIG.issuer,
      }) as PTXAccessToken;
      
      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  /**
   * Check if token needs refresh
   */
  shouldRefreshToken(token: PTXAccessToken): boolean {
    const timeUntilExpiry = token.expiresAt - Date.now();
    return timeUntilExpiry < JWT_CONFIG.refreshThreshold;
  }

  /**
   * Refresh access token with updated balance check
   */
  async refreshAccessToken(currentToken: PTXAccessToken): Promise<VerificationResponse> {
    try {
      // Re-verify current balance
      const balanceVerification = await this.verifyPTXBalance(currentToken.wallet);
      
      if (!balanceVerification.isHolder) {
        return {
          success: false,
          error: 'PTX balance no longer meets minimum requirements',
        };
      }

      // Generate new token with updated data
      const newToken = this.generateAccessToken({
        wallet: currentToken.wallet,
        ptxBalance: balanceVerification.balanceFormatted,
        accessLevel: balanceVerification.accessLevel,
        verified: true,
        timestamp: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000),
      });

      return {
        success: true,
        accessToken: newToken,
        ptxBalance: balanceVerification.balanceFormatted,
        accessLevel: balanceVerification.accessLevel,
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      return {
        success: false,
        error: 'Failed to refresh access token',
      };
    }
  }

  /**
   * Get token information without verification (for display purposes)
   */
  async getTokenInfo() {
    try {
      const [symbol, name, totalSupply] = await Promise.all([
        this.contract.symbol(),
        this.contract.name(),
        this.contract.totalSupply(),
      ]);

      return {
        symbol,
        name,
        totalSupply: ethers.utils.formatUnits(totalSupply, PTX_TOKEN_CONFIG.decimals),
        contractAddress: PTX_TOKEN_CONFIG.contractAddress,
        chainId: PTX_TOKEN_CONFIG.chainId,
      };
    } catch (error) {
      console.error('Failed to get token info:', error);
      return null;
    }
  }
}