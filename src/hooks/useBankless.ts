import { useState, useEffect, useCallback } from 'react';
import { banklessService } from '@/services/banklessOnchain';
import {
  BanklessApiResponse,
  BanklessQueryResult,
  UseBanklessOptions,
  ContractReadParams,
  TransactionHistoryParams,
  EventsParams
} from '@/types/bankless';

/**
 * Hook for reading smart contract state
 */
export function useContractRead(
  params: ContractReadParams | null,
  options: UseBanklessOptions = {}
) {
  const [state, setState] = useState<BanklessQueryResult<any>>({
    data: undefined,
    error: undefined,
    isLoading: false,
    isError: false,
    isSuccess: false,
    refetch: async () => {},
    isFetching: false
  });

  const fetchData = useCallback(async () => {
    if (!params || !options.enabled) return;

    setState(prev => ({ ...prev, isLoading: true, isFetching: true }));

    try {
      const response = await banklessService.readContract(params);
      if (response.success) {
        setState({
          data: response.data,
          error: undefined,
          isLoading: false,
          isError: false,
          isSuccess: true,
          refetch: fetchData,
          isFetching: false
        });
      } else {
        setState({
          data: undefined,
          error: { 
            code: 'READ_ERROR', 
            message: response.error || 'Failed to read contract',
            timestamp: Date.now()
          },
          isLoading: false,
          isError: true,
          isSuccess: false,
          refetch: fetchData,
          isFetching: false
        });
      }
    } catch (error) {
      setState({
        data: undefined,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now()
        },
        isLoading: false,
        isError: true,
        isSuccess: false,
        refetch: fetchData,
        isFetching: false
      });
    }
  }, [params, options.enabled]);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchData();
    }
  }, [fetchData, options.enabled]);

  useEffect(() => {
    if (options.refetchInterval && options.refetchInterval > 0) {
      const interval = setInterval(fetchData, options.refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, options.refetchInterval]);

  return state;
}

/**
 * Hook for getting transaction history
 */
export function useTransactionHistory(
  params: TransactionHistoryParams | null,
  options: UseBanklessOptions = {}
) {
  const [state, setState] = useState<BanklessQueryResult<any>>({
    data: undefined,
    error: undefined,
    isLoading: false,
    isError: false,
    isSuccess: false,
    refetch: async () => {},
    isFetching: false
  });

  const fetchData = useCallback(async () => {
    if (!params || !options.enabled) return;

    setState(prev => ({ ...prev, isLoading: true, isFetching: true }));

    try {
      const response = await banklessService.getTransactionHistory(params);
      if (response.success) {
        setState({
          data: response.data,
          error: undefined,
          isLoading: false,
          isError: false,
          isSuccess: true,
          refetch: fetchData,
          isFetching: false
        });
      } else {
        setState({
          data: undefined,
          error: {
            code: 'HISTORY_ERROR',
            message: response.error || 'Failed to get transaction history',
            timestamp: Date.now()
          },
          isLoading: false,
          isError: true,
          isSuccess: false,
          refetch: fetchData,
          isFetching: false
        });
      }
    } catch (error) {
      setState({
        data: undefined,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now()
        },
        isLoading: false,
        isError: true,
        isSuccess: false,
        refetch: fetchData,
        isFetching: false
      });
    }
  }, [params, options.enabled]);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchData();
    }
  }, [fetchData, options.enabled]);

  return state;
}

/**
 * Hook for getting contract events
 */
export function useContractEvents(
  params: EventsParams | null,
  options: UseBanklessOptions = {}
) {
  const [state, setState] = useState<BanklessQueryResult<any>>({
    data: undefined,
    error: undefined,
    isLoading: false,
    isError: false,
    isSuccess: false,
    refetch: async () => {},
    isFetching: false
  });

  const fetchData = useCallback(async () => {
    if (!params || !options.enabled) return;

    setState(prev => ({ ...prev, isLoading: true, isFetching: true }));

    try {
      const response = await banklessService.getEvents(params);
      if (response.success) {
        setState({
          data: response.data,
          error: undefined,
          isLoading: false,
          isError: false,
          isSuccess: true,
          refetch: fetchData,
          isFetching: false
        });
      } else {
        setState({
          data: undefined,
          error: {
            code: 'EVENTS_ERROR',
            message: response.error || 'Failed to get events',
            timestamp: Date.now()
          },
          isLoading: false,
          isError: true,
          isSuccess: false,
          refetch: fetchData,
          isFetching: false
        });
      }
    } catch (error) {
      setState({
        data: undefined,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now()
        },
        isLoading: false,
        isError: true,
        isSuccess: false,
        refetch: fetchData,
        isFetching: false
      });
    }
  }, [params, options.enabled]);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchData();
    }
  }, [fetchData, options.enabled]);

  return state;
}

/**
 * Hook for getting ERC20 token balance
 */
export function useERC20Balance(
  network: string,
  tokenContract: string,
  userAddress: string,
  options: UseBanklessOptions = {}
) {
  const contractParams = tokenContract && userAddress ? {
    network,
    contract: tokenContract,
    method: 'balanceOf',
    inputs: [{ type: 'address', value: userAddress }],
    outputs: [{ type: 'uint256' }]
  } : null;

  return useContractRead(contractParams, options);
}

/**
 * Hook for getting ERC20 token info
 */
export function useERC20Info(
  network: string,
  tokenContract: string,
  options: UseBanklessOptions = {}
) {
  const [state, setState] = useState<BanklessQueryResult<any>>({
    data: undefined,
    error: undefined,
    isLoading: false,
    isError: false,
    isSuccess: false,
    refetch: async () => {},
    isFetching: false
  });

  const fetchData = useCallback(async () => {
    if (!tokenContract || !options.enabled) return;

    setState(prev => ({ ...prev, isLoading: true, isFetching: true }));

    try {
      const response = await banklessService.getERC20Info(network, tokenContract);
      if (response.success) {
        setState({
          data: response.data,
          error: undefined,
          isLoading: false,
          isError: false,
          isSuccess: true,
          refetch: fetchData,
          isFetching: false
        });
      } else {
        setState({
          data: undefined,
          error: {
            code: 'TOKEN_INFO_ERROR',
            message: response.error || 'Failed to get token info',
            timestamp: Date.now()
          },
          isLoading: false,
          isError: true,
          isSuccess: false,
          refetch: fetchData,
          isFetching: false
        });
      }
    } catch (error) {
      setState({
        data: undefined,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now()
        },
        isLoading: false,
        isError: true,
        isSuccess: false,
        refetch: fetchData,
        isFetching: false
      });
    }
  }, [network, tokenContract, options.enabled]);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchData();
    }
  }, [fetchData, options.enabled]);

  return state;
}

/**
 * Hook for Bankless service initialization
 */
export function useBanklessInit() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const result = await banklessService.initialize();
        setIsInitialized(result);
        if (!result) {
          setError('Failed to initialize Bankless MCP Server');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Initialization error');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  return { isInitialized, isLoading, error };
}

/**
 * Hook for multiple contract reads
 */
export function useMultiContractRead(
  calls: ContractReadParams[],
  options: UseBanklessOptions = {}
) {
  const [state, setState] = useState<BanklessQueryResult<any[]>>({
    data: undefined,
    error: undefined,
    isLoading: false,
    isError: false,
    isSuccess: false,
    refetch: async () => {},
    isFetching: false
  });

  const fetchData = useCallback(async () => {
    if (!calls.length || !options.enabled) return;

    setState(prev => ({ ...prev, isLoading: true, isFetching: true }));

    try {
      const promises = calls.map(call => banklessService.readContract(call));
      const responses = await Promise.all(promises);
      
      const successfulResults = responses.map(response => 
        response.success ? response.data : null
      );
      
      const hasError = responses.some(response => !response.success);
      
      if (hasError) {
        const firstError = responses.find(response => !response.success);
        setState({
          data: undefined,
          error: {
            code: 'MULTI_READ_ERROR',
            message: firstError?.error || 'One or more contract reads failed',
            timestamp: Date.now()
          },
          isLoading: false,
          isError: true,
          isSuccess: false,
          refetch: fetchData,
          isFetching: false
        });
      } else {
        setState({
          data: successfulResults,
          error: undefined,
          isLoading: false,
          isError: false,
          isSuccess: true,
          refetch: fetchData,
          isFetching: false
        });
      }
    } catch (error) {
      setState({
        data: undefined,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now()
        },
        isLoading: false,
        isError: true,
        isSuccess: false,
        refetch: fetchData,
        isFetching: false
      });
    }
  }, [calls, options.enabled]);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchData();
    }
  }, [fetchData, options.enabled]);

  return state;
}