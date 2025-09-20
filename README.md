# ProfesorXTrader 📈

## Professional Trading Dashboard cu AI pentru Monitorizarea Binance

O platformă profesională de trading care combină monitorizarea în timp real a balanței Binance cu analiză AI avansată pentru interpretarea pieței și luarea deciziilor informate.

## 🚀 Caracteristici Principale

### Dashboard Profesional
- **Monitorizare în Timp Real**: Actualizarea continuă a balanței și pozițiilor
- **Analiză Multi-Pereche**: Suport pentru toate perechile de trading Binance
- **Vizualizare Avansată**: Grafice interactive cu indicatori tehnici
- **Alertă Inteligente**: Notificări personalizate bazate pe AI

### Integrare Binance API
- **Autentificare Securizată**: Implementare API key management
- **Rate Limiting**: Respectarea limitelor Binance API
- **Websocket Real-time**: Streaming data pentru actualizări instantanee
- **Order Management**: Plasare și monitorizare ordine

### AI & Machine Learning
- **Analiza Sentimentului**: Interpretarea mișcărilor pieței
- **Pattern Recognition**: Identificarea oportunităților de trading
- **Risk Assessment**: Calculul automat al riscurilor
- **Predicții de Preț**: Analiză predictivă bazată pe ML

## 📋 Funcționalități Implementate

### ✅ Faza 1: Fundația (COMPLETĂ)
- [x] Setup proiect Next.js 14 cu App Router
- [x] Integrare Binance API (Spot & Futures)
- [x] Sistem de autentificare și securitate
- [x] Dashboard de bază cu balanța
- [x] Configurație TypeScript și Tailwind CSS
- [x] Componente UI cu Shadcn/ui
- [x] Sistem de notificări (Toast)
- [x] Theme provider pentru dark/light mode

### 🔄 Faza 2: Analiză Avansată (În Dezvoltare)
- [ ] Implementare AI pentru analiza pieței
- [ ] Grafice interactive cu TradingView
- [ ] Sistem de alertă inteligente
- [ ] Portfolio performance tracking
- [ ] WebSocket pentru streaming real-time
- [ ] Dashboard avansat cu metrici

### 🔮 Faza 3: Automatizare (Planificat)
- [ ] Trading bots cu AI
- [ ] Risk management automat
- [ ] Backtesting engine
- [ ] Social trading features

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 cu App Router
- **UI Library**: Tailwind CSS + Shadcn/ui
- **Charts**: Recharts (TradingView în curs)
- **State Management**: Zustand
- **Icons**: Lucide React

### Backend
- **API**: Next.js API Routes
- **HTTP Client**: Axios
- **WebSockets**: ws pentru streaming real-time
- **Crypto**: crypto-js pentru securitate

### AI & Analytics
- **Machine Learning**: TensorFlow.js (planificat)
- **Data Processing**: Implementat nativ
- **Indicators**: TA-Lib (planificat)
- **NLP**: Pentru analiza știrilor (planificat)

### Infrastructure
- **Deployment**: Vercel-ready
- **Monitoring**: Built-in error handling
- **Security**: API key encryption

## 📋 Setup Dezvoltare

### Prerequizite
- Node.js 18+ 
- npm sau yarn
- Cont Binance cu API keys

### Instalație

```bash
# Clone repository
git clone https://github.com/Gzeu/profesorXtrader.git
cd profesorXtrader

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Editează .env.local cu API keys-urile tale Binance

# Run development server
npm run dev
```

### Configurarea API Keys Binance

1. **Creează API Key în Binance**:
   - Merge la [Binance API Management](https://www.binance.com/en/usercenter/settings/api-management)
   - Creează un nou API Key
   - Activează permisiunile "Enable Reading" pentru Spot și Futures
   - **NU activa "Enable Trading"** pentru siguranță

2. **Adaugă credențialele în .env.local**:
   ```env
   BINANCE_API_KEY=your_api_key_here
   BINANCE_SECRET_KEY=your_secret_key_here
   BINANCE_TESTNET=false
   ```

3. **Testează conexiunea**:
   - Rulează aplicația: `npm run dev`
   - Deschide [http://localhost:3000](http://localhost:3000)
   - Apăsă "Configurează API" și introdu credențialele

## 📖 API Routes Disponibile

### Configurație
- `GET /api/config` - Obține starea configurării
- `POST /api/config` - Salveză API keys-urile
- `DELETE /api/config` - Șterge configurația

### Binance API
- `POST /api/binance/test` - Testează credențialele API
- `GET /api/binance/account` - Informații cont (Spot + Futures)
- `GET /api/binance/prices` - Prețuri și statistici 24h

## 📈 Structura Proiectului

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes
│   │   ├── binance/        # Binance API endpoints
│   │   └── config/         # Configuration endpoints
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # React components
│   ├── providers/          # Context providers
│   └── ui/                 # UI components (Shadcn)
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
│   ├── binance-client.ts   # Binance API client
│   └── utils.ts            # Helper functions
└── types/                  # TypeScript definitions
    └── binance.ts          # Binance API types
```

## 🔒 Securitate

- API keys encrypt at rest
- Rate limiting și DDoS protection
- Validare input-uri
- Error handling avansat
- Logs pentru toate acțiunile

## 📦 Deployment

### Vercel (Recomandat)

1. Fork proiectul pe GitHub
2. Conectează repository-ul la Vercel
3. Adaugă environment variables în Vercel dashboard
4. Deploy automat la fiecare commit

### Docker

```bash
# Build image
docker build -t profesorxtrader .

# Run container
docker run -p 3000:3000 --env-file .env profesorxtrader
```

## 📄 Licență

Acest proiect este licențiat sub MIT License - vezi fișierul [LICENSE](LICENSE) pentru detalii.

## 📢 Contact

**Dezvoltator**: George Pricop (Gzeu)  
**GitHub**: [@Gzeu](https://github.com/Gzeu)  
**Email**: [Contact GitHub](https://github.com/Gzeu)

## 🌟 Contributing

Contribuțiile sunt binevenite! Te rog:

1. Fork proiectul
2. Creează o branch pentru feature (`git checkout -b feature/AmazingFeature`)
3. Commit schimbările (`git commit -m 'Add some AmazingFeature'`)
4. Push pe branch (`git push origin feature/AmazingFeature`)
5. Deschide un Pull Request

---

⭐ **Dacă proiectul îți place, nu uita să dai o stea!** ⭐

*ProfesorXTrader v0.1.0 - Dashboard Profesional de Trading cu AI*
