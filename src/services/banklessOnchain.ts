// Bankless Onchain MCP Integration Service
// Provides blockchain data access through Bankless API

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ContractReadParams {
  network: string;
  contract: string;
  method: string;
  inputs: Array<{ type: string; value: any }>;
  outputs: Array<{ type: string }>;
}

export interface TransactionHistoryParams {
  network: string;
  userAddress: string;
  contract?: string;
  methodId?: string;
  startBlock?: number;
  includeData?: boolean;
}

export interface EventsParams {
  network: string;
  addresses: string[];
  topic: string;
  optionalTopics?: (string | null)[];
}

export interface BanklessResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class BanklessOnchainService {
  private apiToken: string;
  private mcpServerProcess: any = null;

  constructor() {
    this.apiToken = process.env.BANKLESS_API_TOKEN || '';
    if (!this.apiToken) {
      console.warn('BANKLESS_API_TOKEN not found in environment variables');
    }
  }

  /**
   * Initialize MCP server connection
   */
  async initialize(): Promise<boolean> {
    try {
      // Check if MCP server is available
      const { stdout } = await execAsync('npx @bankless/onchain-mcp --version');
      console.log('Bankless Onchain MCP Server available:', stdout.trim());
      return true;
    } catch (error) {
      console.error('Failed to initialize Bankless MCP:', error);
      return false;
    }
  }

  /**
   * Read smart contract state
   */
  async readContract(params: ContractReadParams): Promise<BanklessResponse> {
    try {
      const command = this.buildMcpCommand('read_contract', params);
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        console.error('MCP Error:', stderr);
        return { success: false, error: stderr };
      }

      const result = JSON.parse(stdout);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error reading contract:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get transaction history for an address
   */
  async getTransactionHistory(params: TransactionHistoryParams): Promise<BanklessResponse> {
    try {
      const command = this.buildMcpCommand('get_transaction_history', params);
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        console.error('MCP Error:', stderr);
        return { success: false, error: stderr };
      }

      const result = JSON.parse(stdout);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get contract events
   */
  async getEvents(params: EventsParams): Promise<BanklessResponse> {
    try {
      const command = this.buildMcpCommand('get_events', params);
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        console.error('MCP Error:', stderr);
        return { success: false, error: stderr };
      }

      const result = JSON.parse(stdout);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error getting events:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get contract ABI
   */
  async getABI(network: string, contract: string): Promise<BanklessResponse> {
    try {
      const command = this.buildMcpCommand('get_abi', { network, contract });
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        console.error('MCP Error:', stderr);
        return { success: false, error: stderr };
      }

      const result = JSON.parse(stdout);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error getting ABI:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get contract source code
   */
  async getSource(network: string, contract: string): Promise<BanklessResponse> {
    try {
      const command = this.buildMcpCommand('get_source', { network, contract });
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        console.error('MCP Error:', stderr);
        return { success: false, error: stderr };
      }

      const result = JSON.parse(stdout);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error getting source:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Build event topic hash
   */
  async buildEventTopic(network: string, eventName: string, arguments: Array<{ type: string }>): Promise<BanklessResponse> {
    try {
      const command = this.buildMcpCommand('build_event_topic', {
        network,
        name: eventName,
        arguments
      });
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        console.error('MCP Error:', stderr);
        return { success: false, error: stderr };
      }

      const result = JSON.parse(stdout);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error building event topic:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get ERC20 token balance
   */
  async getERC20Balance(network: string, tokenContract: string, userAddress: string): Promise<BanklessResponse> {
    return this.readContract({
      network,
      contract: tokenContract,
      method: 'balanceOf',
      inputs: [{ type: 'address', value: userAddress }],
      outputs: [{ type: 'uint256' }]
    });
  }

  /**
   * Get ERC20 token info
   */
  async getERC20Info(network: string, tokenContract: string): Promise<BanklessResponse> {
    try {
      const [name, symbol, decimals] = await Promise.all([
        this.readContract({
          network,
          contract: tokenContract,
          method: 'name',
          inputs: [],
          outputs: [{ type: 'string' }]
        }),
        this.readContract({
          network,
          contract: tokenContract,
          method: 'symbol',
          inputs: [],
          outputs: [{ type: 'string' }]
        }),
        this.readContract({
          network,
          contract: tokenContract,
          method: 'decimals',
          inputs: [],
          outputs: [{ type: 'uint8' }]
        })
      ]);

      return {
        success: true,
        data: {
          name: name.data?.[0]?.value,
          symbol: symbol.data?.[0]?.value,
          decimals: decimals.data?.[0]?.value
        }
      };
    } catch (error) {
      console.error('Error getting ERC20 info:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Build MCP command string
   */
  private buildMcpCommand(tool: string, params: any): string {
    const env = this.apiToken ? `BANKLESS_API_TOKEN=${this.apiToken}` : '';
    const paramsJson = JSON.stringify(params).replace(/"/g, '\\"');
    return `${env} npx @bankless/onchain-mcp --tool ${tool} --params "${paramsJson}"`;
  }

  /**
   * Validate network support
   */
  isNetworkSupported(network: string): boolean {
    const supportedNetworks = ['ethereum', 'polygon', 'base', 'arbitrum', 'optimism'];
    return supportedNetworks.includes(network.toLowerCase());
  }
}

// Singleton instance
export const banklessService = new BanklessOnchainService();
export default BanklessOnchainService;