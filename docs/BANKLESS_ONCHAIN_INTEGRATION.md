# Bankless Onchain MCP Integration

Integrarea serverului Bankless Onchain MCP în profesorXtrader pentru acces la date blockchain în timp real.

## Funcționalități Disponibile

### Contract Operations
- **read_contract**: Citirea stării contractelor smart
- **get_proxy**: Recuperarea adreselor de implementare proxy
- **get_abi**: Obținerea ABI-ului contractului
- **get_source**: Recuperarea codului sursă verificat

### Event Operations  
- **get_events**: Obținerea log-urilor de evenimente
- **build_event_topic**: Generarea semnăturilor topic-urilor

### Transaction Operations
- **get_transaction_history**: Istoric tranzacții pentru adrese
- **get_transaction_info**: Detalii complete despre tranzacții

## Configurare

### 1. Instalare Dependențe
```bash
npm install @bankless/onchain-mcp
```

### 2. Variabile de Mediu
Adaugă în .env:
```
BANKLESS_API_TOKEN=your_api_token_here
```

### 3. Configurare MCP (pentru Claude Desktop)
```json
{
  "mcpServers": {
    "bankless": {
      "command": "npx",
      "args": ["@bankless/onchain-mcp"],
      "env": {
        "BANKLESS_API_TOKEN": "your_api_token_here"
      }
    }
  }
}
```

## Implementare în profesorXtrader

### Service Layer
- Crearea `BanklessOnchainService` pentru interacțiunea cu MCP
- Integrarea cu starea Redux pentru cache-uirea datelor
- Rate limiting și error handling

### UI Components
- Dashboard pentru monitorizarea contractelor
- Vizualizarea istoricului de tranzacții
- Analiză evenimente în timp real

### Exemple de Utilizare

#### Citirea Balanței ERC20
```javascript
const balance = await banklessService.readContract({
  network: "ethereum",
  contract: "0xA0b86a33E6441E45cD4B448f65bDbF5F13D1e614",
  method: "balanceOf",
  inputs: [{ type: "address", value: userAddress }],
  outputs: [{ type: "uint256" }]
});
```

#### Monitorizarea Evenimentelor Transfer
```javascript
const events = await banklessService.getEvents({
  network: "ethereum",
  addresses: [contractAddress],
  topic: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
});
```

## Rețele Suportate
- Ethereum
- Polygon
- Base
- Arbitrum
- Optimism

## Rate Limits
- 10 cereri/minut pentru utilizatorii Bankless Citizens
- Pentru utilizare comercială, contactați suportul

## Beneficii pentru profesorXtrader
1. **Date în timp real** de pe blockchain
2. **Analiză avansată** a contractelor smart
3. **Monitorizarea** activității on-chain
4. **Integrare AI** pentru predicții