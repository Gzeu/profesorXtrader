'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Activity, TrendingUp, Wallet, History } from 'lucide-react';
import { banklessService } from '@/services/banklessOnchain';
import { 
  ContractInfo, 
  TokenBalance, 
  TransactionData, 
  EventLog,
  SupportedNetworks 
} from '@/types/bankless';

interface BanklessDashboardProps {
  className?: string;
}

export default function BanklessDashboard({ className }: BanklessDashboardProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('ethereum');
  const [contractAddress, setContractAddress] = useState<string>('');
  const [userAddress, setUserAddress] = useState<string>('');
  
  // Data states
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<TransactionData[]>([]);
  const [events, setEvents] = useState<EventLog[]>([]);

  const supportedNetworks = Object.values(SupportedNetworks);

  useEffect(() => {
    initializeBankless();
  }, []);

  const initializeBankless = async () => {
    try {
      setLoading(true);
      const initialized = await banklessService.initialize();
      setIsInitialized(initialized);
      if (!initialized) {
        setError('Failed to initialize Bankless MCP Server. Please check your API token.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown initialization error');
    } finally {
      setLoading(false);
    }
  };

  const handleGetContractInfo = async () => {
    if (!contractAddress || !banklessService.isNetworkSupported(selectedNetwork)) {
      setError('Please enter a valid contract address and select a supported network');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get basic contract info (ABI and source)
      const [abiResponse, sourceResponse] = await Promise.all([
        banklessService.getABI(selectedNetwork, contractAddress),
        banklessService.getSource(selectedNetwork, contractAddress)
      ]);

      if (abiResponse.success || sourceResponse.success) {
        setContractInfo({
          address: contractAddress,
          abi: abiResponse.data,
          sourceCode: sourceResponse.data?.sourceCode,
          verified: sourceResponse.success,
          name: sourceResponse.data?.contractName
        });
      } else {
        setError('Failed to fetch contract information');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching contract info');
    } finally {
      setLoading(false);
    }
  };

  const handleGetTokenBalance = async () => {
    if (!contractAddress || !userAddress) {
      setError('Please enter both contract and user addresses');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const balanceResponse = await banklessService.getERC20Balance(
        selectedNetwork,
        contractAddress,
        userAddress
      );

      if (balanceResponse.success) {
        setTokenBalance(balanceResponse.data?.[0]?.value || '0');
      } else {
        setError('Failed to fetch token balance');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching balance');
    } finally {
      setLoading(false);
    }
  };

  const handleGetTransactionHistory = async () => {
    if (!userAddress) {
      setError('Please enter a user address');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const historyResponse = await banklessService.getTransactionHistory({
        network: selectedNetwork,
        userAddress,
        includeData: true
      });

      if (historyResponse.success) {
        setTransactionHistory(historyResponse.data || []);
      } else {
        setError('Failed to fetch transaction history');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching history');
    } finally {
      setLoading(false);
    }
  };

  const handleGetEvents = async () => {
    if (!contractAddress) {
      setError('Please enter a contract address');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build Transfer event topic
      const topicResponse = await banklessService.buildEventTopic(
        selectedNetwork,
        'Transfer(address,address,uint256)',
        [
          { type: 'address' },
          { type: 'address' },
          { type: 'uint256' }
        ]
      );

      if (topicResponse.success) {
        const eventsResponse = await banklessService.getEvents({
          network: selectedNetwork,
          addresses: [contractAddress],
          topic: topicResponse.data
        });

        if (eventsResponse.success) {
          setEvents(eventsResponse.data?.result || []);
        } else {
          setError('Failed to fetch events');
        }
      } else {
        setError('Failed to build event topic');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching events');
    } finally {
      setLoading(false);
    }
  };

  if (!isInitialized && !loading) {
    return (
      <Alert className={className}>
        <AlertDescription>
          Bankless MCP Server is not initialized. Please check your BANKLESS_API_TOKEN environment variable.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Bankless Onchain Dashboard
          </CardTitle>
          <CardDescription>
            Interact with blockchain data using Bankless MCP Server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Network Selection */}
          <div className="flex gap-2">
            <Label htmlFor="network">Network:</Label>
            <select
              id="network"
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="px-3 py-1 border rounded"
            >
              {supportedNetworks.map((network) => (
                <option key={network} value={network}>
                  {network.charAt(0).toUpperCase() + network.slice(1)}
                </option>
              ))}
            </select>
            <Badge variant="secondary">
              {banklessService.isNetworkSupported(selectedNetwork) ? 'Supported' : 'Not Supported'}
            </Badge>
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contract">Contract Address:</Label>
              <Input
                id="contract"
                placeholder="0x..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="user">User Address:</Label>
              <Input
                id="user"
                placeholder="0x..."
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="contract" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contract">Contract Info</TabsTrigger>
          <TabsTrigger value="balance">Token Balance</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="contract">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Contract Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleGetContractInfo} 
                disabled={loading || !contractAddress}
                className="mb-4"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Contract Info
              </Button>

              {contractInfo && (
                <div className="space-y-4">
                  <div>
                    <Label>Address:</Label>
                    <p className="font-mono text-sm">{contractInfo.address}</p>
                  </div>
                  {contractInfo.name && (
                    <div>
                      <Label>Name:</Label>
                      <p>{contractInfo.name}</p>
                    </div>
                  )}
                  <div>
                    <Label>Verified:</Label>
                    <Badge variant={contractInfo.verified ? 'success' : 'secondary'}>
                      {contractInfo.verified ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  {contractInfo.abi && (
                    <div>
                      <Label>ABI Available:</Label>
                      <Badge variant="success">Yes</Badge>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Token Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleGetTokenBalance} 
                disabled={loading || !contractAddress || !userAddress}
                className="mb-4"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Balance
              </Button>

              {tokenBalance !== null && (
                <div>
                  <Label>Balance:</Label>
                  <p className="font-mono text-lg">{tokenBalance}</p>
                  <p className="text-sm text-muted-foreground">
                    Raw balance (in wei for ETH, smallest unit for tokens)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleGetTransactionHistory} 
                disabled={loading || !userAddress}
                className="mb-4"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Transaction History
              </Button>

              {transactionHistory.length > 0 && (
                <div className="space-y-2">
                  {transactionHistory.slice(0, 5).map((tx, index) => (
                    <div key={index} className="p-3 border rounded">
                      <div className="font-mono text-sm">
                        Hash: {tx.hash}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Block: {tx.blockNumber} | Status: {tx.status ? 'Success' : 'Failed'}
                      </div>
                    </div>
                  ))}
                  {transactionHistory.length > 5 && (
                    <p className="text-sm text-muted-foreground">
                      Showing first 5 of {transactionHistory.length} transactions
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Contract Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleGetEvents} 
                disabled={loading || !contractAddress}
                className="mb-4"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Transfer Events
              </Button>

              {events.length > 0 && (
                <div className="space-y-2">
                  {events.slice(0, 5).map((event, index) => (
                    <div key={index} className="p-3 border rounded">
                      <div className="font-mono text-sm">
                        TX: {event.transactionHash}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Block: {event.blockNumber} | Log Index: {event.logIndex}
                      </div>
                    </div>
                  ))}
                  {events.length > 5 && (
                    <p className="text-sm text-muted-foreground">
                      Showing first 5 of {events.length} events
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}