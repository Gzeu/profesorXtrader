const Binance = require('node-binance-api');
const WebSocket = require('ws');
const crypto = require('crypto');

class BinanceService {
    constructor() {
        this.client = new Binance().options({
            APIKEY: process.env.BINANCE_API_KEY,
            APISECRET: process.env.BINANCE_SECRET_KEY,
            useServerTime: true,
            recvWindow: 60000,
            verbose: true,
            family: 4,
            urls: {
                base: 'https://api.binance.com/api/',
                wapi: 'https://api.binance.com/wapi/',
                sapi: 'https://api.binance.com/sapi/',
                fapi: 'https://fapi.binance.com/fapi/',
                fapitest: 'https://testnet.binancefuture.com/fapi/',
                stream: 'wss://stream.binance.com:9443/ws/',
                fstream: 'wss://fstream.binance.com/ws/'
            }
        });
        
        this.websockets = new Map();
        this.isConnected = false;
        this.reconnectAttempts = new Map();
        this.maxReconnectAttempts = 5;
        this.lastPrices = new Map();
        
        // Performance metrics
        this.metrics = {
            requests: 0,
            errors: 0,
            lastUpdate: new Date(),
            avgLatency: 0
        };
    }

    // 📡 ACCOUNT MANAGEMENT
    async getAccountInfo() {
        try {
            const startTime = Date.now();
            const account = await this.client.account();
            this.updateMetrics(Date.now() - startTime);
            
            this.isConnected = true;
            
            // Calculate total portfolio value
            const balances = account.balances.filter(b => 
                parseFloat(b.free) > 0 || parseFloat(b.locked) > 0
            );
            
            let totalValueUSDT = 0;
            for (const balance of balances) {
                if (balance.asset === 'USDT') {
                    totalValueUSDT += parseFloat(balance.free) + parseFloat(balance.locked);
                } else if (parseFloat(balance.free) + parseFloat(balance.locked) > 0) {
                    try {
                        const price = await this.getLivePrice(`${balance.asset}USDT`);
                        totalValueUSDT += (parseFloat(balance.free) + parseFloat(balance.locked)) * price;
                    } catch (e) {
                        // Skip assets that don't have USDT pair
                    }
                }
            }

            return {
                success: true,
                totalWalletBalance: totalValueUSDT.toFixed(2),
                totalUnrealizedProfit: account.totalUnrealizedProfit || '0.00',
                balances: balances.map(b => ({
                    asset: b.asset,
                    free: parseFloat(b.free),
                    locked: parseFloat(b.locked),
                    total: parseFloat(b.free) + parseFloat(b.locked)
                })),
                accountType: account.accountType || 'SPOT',
                canTrade: account.canTrade,
                canWithdraw: account.canWithdraw,
                canDeposit: account.canDeposit,
                permissions: account.permissions || []
            };
        } catch (error) {
            this.isConnected = false;
            this.metrics.errors++;
            throw new Error(`Binance API Error: ${error.message}`);
        }
    }

    // 💰 FUTURES ACCOUNT
    async getFuturesAccountInfo() {
        try {
            const account = await this.client.futuresAccount();
            return {
                success: true,
                totalWalletBalance: account.totalWalletBalance,
                totalUnrealizedProfit: account.totalUnrealizedProfit,
                totalMarginBalance: account.totalMarginBalance,
                totalInitialMargin: account.totalInitialMargin,
                totalMaintMargin: account.totalMaintMargin,
                availableBalance: account.availableBalance,
                maxWithdrawAmount: account.maxWithdrawAmount,
                assets: account.assets.filter(a => parseFloat(a.walletBalance) > 0),
                positions: account.positions.filter(p => parseFloat(p.positionAmt) !== 0)
            };
        } catch (error) {
            throw new Error(`Futures API Error: ${error.message}`);
        }
    }

    // 📈 ORDER MANAGEMENT
    async placeOrder(symbol, side, type, quantity, price = null, options = {}) {
        try {
            const orderParams = {
                symbol: symbol.toUpperCase(),
                side: side.toUpperCase(),
                type: type.toUpperCase(),
                quantity: quantity,
                timestamp: Date.now(),
                ...options
            };

            // Add price for limit orders
            if (type.toUpperCase() === 'LIMIT') {
                if (!price) throw new Error('Price required for LIMIT orders');
                orderParams.price = price;
                orderParams.timeInForce = options.timeInForce || 'GTC';
            }

            // Add stop price for stop orders
            if (type.toUpperCase().includes('STOP')) {
                if (!options.stopPrice) throw new Error('stopPrice required for STOP orders');
                orderParams.stopPrice = options.stopPrice;
            }

            const order = await this.client.order(orderParams);
            
            return {
                success: true,
                orderId: order.orderId,
                clientOrderId: order.clientOrderId,
                symbol: order.symbol,
                status: order.status,
                executedQty: parseFloat(order.executedQty),
                cummulativeQuoteQty: parseFloat(order.cummulativeQuoteQty),
                price: parseFloat(order.price || '0'),
                origQty: parseFloat(order.origQty),
                side: order.side,
                type: order.type,
                timeInForce: order.timeInForce,
                fills: order.fills || []
            };
        } catch (error) {
            this.metrics.errors++;
            throw new Error(`Order Error: ${error.message}`);
        }
    }

    // 📊 FUTURES ORDER
    async placeFuturesOrder(symbol, side, type, quantity, price = null, options = {}) {
        try {
            const orderParams = {
                symbol: symbol.toUpperCase(),
                side: side.toUpperCase(),
                type: type.toUpperCase(),
                quantity: quantity,
                timestamp: Date.now(),
                ...options
            };

            if (type.toUpperCase() === 'LIMIT') {
                orderParams.price = price;
                orderParams.timeInForce = options.timeInForce || 'GTC';
            }

            const order = await this.client.futuresOrder(orderParams);
            
            return {
                success: true,
                orderId: order.orderId,
                symbol: order.symbol,
                status: order.status,
                executedQty: parseFloat(order.executedQty),
                avgPrice: parseFloat(order.avgPrice || '0'),
                side: order.side,
                type: order.type
            };
        } catch (error) {
            throw new Error(`Futures Order Error: ${error.message}`);
        }
    }

    // 💹 MARKET DATA
    async getLivePrice(symbol) {
        try {
            const ticker = await this.client.prices(symbol);
            const price = parseFloat(ticker[symbol]);
            this.lastPrices.set(symbol, price);
            return price;
        } catch (error) {
            throw new Error(`Price Error: ${error.message}`);
        }
    }

    async get24hrStats(symbol) {
        try {
            const stats = await this.client.prevDay(symbol);
            return {
                symbol: stats.symbol,
                priceChange: parseFloat(stats.priceChange),
                priceChangePercent: parseFloat(stats.priceChangePercent),
                weightedAvgPrice: parseFloat(stats.weightedAvgPrice),
                openPrice: parseFloat(stats.openPrice),
                highPrice: parseFloat(stats.highPrice),
                lowPrice: parseFloat(stats.lowPrice),
                lastPrice: parseFloat(stats.lastPrice),
                volume: parseFloat(stats.volume),
                quoteVolume: parseFloat(stats.quoteVolume),
                openTime: stats.openTime,
                closeTime: stats.closeTime,
                count: stats.count
            };
        } catch (error) {
            throw new Error(`24hr Stats Error: ${error.message}`);
        }
    }

    // 📊 HISTORICAL DATA
    async getHistoricalData(symbol, interval = '1m', limit = 100, startTime = null, endTime = null) {
        try {
            const options = { limit };
            if (startTime) options.startTime = startTime;
            if (endTime) options.endTime = endTime;
            
            const candles = await this.client.candlesticks(symbol, interval, options);
            
            return candles.map(candle => ({
                openTime: candle[0],
                open: parseFloat(candle[1]),
                high: parseFloat(candle[2]),
                low: parseFloat(candle[3]),
                close: parseFloat(candle[4]),
                volume: parseFloat(candle[5]),
                closeTime: candle[6],
                quoteAssetVolume: parseFloat(candle[7]),
                numberOfTrades: candle[8],
                takerBuyBaseAssetVolume: parseFloat(candle[9]),
                takerBuyQuoteAssetVolume: parseFloat(candle[10])
            }));
        } catch (error) {
            throw new Error(`Historical Data Error: ${error.message}`);
        }
    }

    // ⚡ WEBSOCKET STREAMING
    startWebSocket(symbols, callback, type = 'ticker') {
        const streamNames = symbols.map(s => `${s.toLowerCase()}@${type}`);
        const streamUrl = streamNames.join('/');
        
        try {
            this.client.websockets.combined(streamNames, (streamData) => {
                const formattedData = this.formatWebSocketData(streamData, type);
                callback(formattedData);
            });
            
            console.log(`✅ WebSocket connected for symbols: ${symbols.join(', ')}`);
        } catch (error) {
            console.error(`WebSocket Error: ${error.message}`);
            setTimeout(() => this.reconnectWebSocket(symbols, callback, type), 5000);
        }
    }

    // 🔄 RECONNECT LOGIC
    reconnectWebSocket(symbols, callback, type) {
        const key = symbols.join(',');
        const attempts = this.reconnectAttempts.get(key) || 0;
        
        if (attempts < this.maxReconnectAttempts) {
            console.log(`🔄 Reconnecting WebSocket for ${symbols.join(', ')} (attempt ${attempts + 1})`);
            this.reconnectAttempts.set(key, attempts + 1);
            this.startWebSocket(symbols, callback, type);
        } else {
            console.error(`❌ Max reconnection attempts reached for ${symbols.join(', ')}`);
        }
    }

    // 🔧 FORMAT WEBSOCKET DATA
    formatWebSocketData(data, type) {
        switch (type) {
            case 'ticker':
                return {
                    symbol: data.s,
                    price: parseFloat(data.c),
                    change: parseFloat(data.p),
                    changePercent: parseFloat(data.P),
                    volume: parseFloat(data.v),
                    quoteVolume: parseFloat(data.q),
                    high: parseFloat(data.h),
                    low: parseFloat(data.l),
                    open: parseFloat(data.o),
                    timestamp: data.E,
                    count: data.n
                };
            case 'kline':
                const kline = data.k;
                return {
                    symbol: kline.s,
                    interval: kline.i,
                    openTime: kline.t,
                    closeTime: kline.T,
                    open: parseFloat(kline.o),
                    close: parseFloat(kline.c),
                    high: parseFloat(kline.h),
                    low: parseFloat(kline.l),
                    volume: parseFloat(kline.v),
                    quoteVolume: parseFloat(kline.q),
                    isClosed: kline.x
                };
            default:
                return data;
        }
    }

    // 📋 ORDER BOOK
    async getOrderBook(symbol, limit = 100) {
        try {
            const depth = await this.client.depth(symbol, limit);
            return {
                lastUpdateId: depth.lastUpdateId,
                bids: depth.bids.map(bid => ({
                    price: parseFloat(bid[0]),
                    quantity: parseFloat(bid[1])
                })),
                asks: depth.asks.map(ask => ({
                    price: parseFloat(ask[0]),
                    quantity: parseFloat(ask[1])
                }))
            };
        } catch (error) {
            throw new Error(`Order Book Error: ${error.message}`);
        }
    }

    // 📊 RECENT TRADES
    async getRecentTrades(symbol, limit = 100) {
        try {
            const trades = await this.client.trades(symbol, limit);
            return trades.map(trade => ({
                id: trade.id,
                price: parseFloat(trade.price),
                qty: parseFloat(trade.qty),
                quoteQty: parseFloat(trade.quoteQty),
                time: trade.time,
                isBuyerMaker: trade.isBuyerMaker,
                isBestMatch: trade.isBestMatch
            }));
        } catch (error) {
            throw new Error(`Recent Trades Error: ${error.message}`);
        }
    }

    // 🎯 CANCEL ORDER
    async cancelOrder(symbol, orderId, origClientOrderId = null) {
        try {
            const params = { symbol, timestamp: Date.now() };
            if (orderId) params.orderId = orderId;
            if (origClientOrderId) params.origClientOrderId = origClientOrderId;
            
            const result = await this.client.cancel(params);
            return {
                success: true,
                symbol: result.symbol,
                orderId: result.orderId,
                status: result.status
            };
        } catch (error) {
            throw new Error(`Cancel Order Error: ${error.message}`);
        }
    }

    // 📈 GET OPEN ORDERS
    async getOpenOrders(symbol = null) {
        try {
            const params = { timestamp: Date.now() };
            if (symbol) params.symbol = symbol;
            
            const orders = await this.client.openOrders(params);
            return orders.map(order => ({
                symbol: order.symbol,
                orderId: order.orderId,
                clientOrderId: order.clientOrderId,
                price: parseFloat(order.price),
                origQty: parseFloat(order.origQty),
                executedQty: parseFloat(order.executedQty),
                status: order.status,
                timeInForce: order.timeInForce,
                type: order.type,
                side: order.side,
                stopPrice: parseFloat(order.stopPrice || '0'),
                time: order.time,
                updateTime: order.updateTime
            }));
        } catch (error) {
            throw new Error(`Open Orders Error: ${error.message}`);
        }
    }

    // 📊 PERFORMANCE METRICS
    updateMetrics(latency) {
        this.metrics.requests++;
        this.metrics.avgLatency = (this.metrics.avgLatency + latency) / 2;
        this.metrics.lastUpdate = new Date();
    }

    getMetrics() {
        return {
            ...this.metrics,
            isConnected: this.isConnected,
            totalWebSockets: this.websockets.size,
            uptime: Date.now() - (this.metrics.lastUpdate?.getTime() || Date.now())
        };
    }

    // 🔐 CONNECTION TEST
    async testConnection() {
        try {
            await this.client.time();
            this.isConnected = true;
            return { success: true, message: 'Connection successful' };
        } catch (error) {
            this.isConnected = false;
            return { success: false, message: error.message };
        }
    }

    // 🛑 CLEANUP
    cleanup() {
        this.websockets.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        });
        this.websockets.clear();
        console.log('🧹 Binance service cleanup completed');
    }
}

module.exports = BinanceService;