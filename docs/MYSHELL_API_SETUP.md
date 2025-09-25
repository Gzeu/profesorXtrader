# MyShell API Setup Guide 🚀

## 🔑 Configurare API Key MyShell

Urmează aceste pași pentru a configura API key-ul MyShell în proiectul tău:

### **Step 1: Environment Variables Setup**

Adaugă API key-ul în fișierul tău `.env.local`:

```env
# MyShell AI Integration
MYSHELL_API_KEY=14b07dbc042c33bb808c75aa38726173c9e39576b446eedcbb66cbeacd27a77c
MYSHELL_WEBHOOK_SECRET=your_custom_webhook_secret
MYSHELL_BOT_ID=your_bot_id_when_created
ENABLE_MYSHELL_FEATURES=true
```

**⚠️ IMPORTANT:** 
- **NU** adăuga API key-ul direct în cod!
- **NU** face commit la fișierul `.env.local`!
- Folosește întotdeauna `process.env.MYSHELL_API_KEY`

### **Step 2: Vercel Deployment Setup**

Pentru deployment pe Vercel, adaugă environment variables în dashboard-ul Vercel:

1. Mergi la **Vercel Dashboard** → **profesorxtrader** → **Settings** → **Environment Variables**
2. Adaugă:
   ```
   MYSHELL_API_KEY = 14b07dbc042c33bb808c75aa38726173c9e39576b446eedcbb66cbeacd27a77c
   MYSHELL_WEBHOOK_SECRET = your_custom_secret
   ENABLE_MYSHELL_FEATURES = true
   ```
3. **Redeploy** proiectul pentru a aplica changes

### **Step 3: Update API Implementation**

API key-ul se folosește în `src/app/api/myshell/route.ts` astfel:

```typescript
// Verificare API key în headers sau config
const apiKey = process.env.MYSHELL_API_KEY;

if (!apiKey) {
  throw new Error('MyShell API key not configured');
}

// Folosește API key-ul pentru autentificare MyShell
const headers = {
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json'
};
```

### **Step 4: Bot Configuration Update**

În `myshell-configs/bot-config.json`, asigură-te că URL-ul API-ului este corect:

```json
{
  "widgets": [{
    "name": "ai_analysis",
    "type": "Crawler",
    "url": "https://YOUR-VERCEL-DOMAIN.vercel.app/api/myshell",
    "method": "POST",
    "headers": {
      "Authorization": "Bearer YOUR_API_KEY",
      "Content-Type": "application/json"
    }
  }]
}
```

### **Step 5: Testing API Key Setup**

```bash
# Test local cu API key
echo "MYSHELL_API_KEY=14b07dbc042c33bb808c75aa38726173c9e39576b446eedcbb66cbeacd27a77c" >> .env.local

# Start development server
npm run dev

# Test MyShell endpoint
curl -X POST http://localhost:3000/api/myshell \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 14b07dbc042c33bb808c75aa38726173c9e39576b446eedcbb66cbeacd27a77c" \
  -d '{
    "action": "comprehensive_analysis",
    "symbol": "bitcoin"
  }'
```

## 🔒 Security Best Practices

### **⚠️ DO NOT:**
- Commit API key-uri în repository
- Hard-code API keys în source code
- Share API keys în pull requests
- Log API keys în console sau files

### **✅ DO:**
- Folosește environment variables
- Add `.env.local` în `.gitignore`
- Rotește API keys periodic
- Monitor API usage și rate limits

## 📡 API Key Management

### **Local Development**
```bash
# Create .env.local (already in .gitignore)
cp .env.example .env.local

# Edit with your actual keys
vim .env.local  # or nano, code, etc.
```

### **Production (Vercel)**
1. **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Add `MYSHELL_API_KEY` cu valoarea ta
3. Set pentru **Production**, **Preview**, și **Development**
4. **Save** și **Redeploy**

### **CI/CD (GitHub Actions)**
API key-ul trebuie adăugat și în **GitHub Secrets**:

1. **GitHub Repository** → **Settings** → **Secrets and Variables** → **Actions**
2. **New repository secret:**
   - **Name:** `MYSHELL_API_KEY`
   - **Secret:** `14b07dbc042c33bb808c75aa38726173c9e39576b446eedcbb66cbeacd27a77c`
3. Update workflow file să folosească secretul

## 📊 API Usage Examples

### **Basic Usage**
```typescript
// In your API route or component
const myshellApiKey = process.env.MYSHELL_API_KEY;

if (!myshellApiKey) {
  throw new Error('MyShell API key not found');
}

// Use in API calls
const response = await fetch('https://api.myshell.ai/v1/...', {
  headers: {
    'Authorization': `Bearer ${myshellApiKey}`,
    'Content-Type': 'application/json'
  },
  method: 'POST',
  body: JSON.stringify({ /* your data */ })
});
```

### **Validation Check**
```typescript
// Validate API key format
function validateMyShellApiKey(key: string): boolean {
  return /^[a-f0-9]{64}$/.test(key); // 64 character hex string
}

if (!validateMyShellApiKey(process.env.MYSHELL_API_KEY || '')) {
  console.error('Invalid MyShell API key format');
}
```

## 🛠 Troubleshooting

### **Common Issues**

1. **API Key Not Found**
   ```
   Error: MyShell API key not configured
   ```
   **Solution:** Verifică că `MYSHELL_API_KEY` este în `.env.local`

2. **Invalid API Key**
   ```
   Error: 401 Unauthorized
   ```
   **Solution:** Verifică că API key-ul este corect și activ

3. **Rate Limiting**
   ```
   Error: 429 Too Many Requests
   ```
   **Solution:** Implementează rate limiting în aplicație

### **Debug Commands**
```bash
# Check if API key is loaded
node -e "console.log('API Key loaded:', !!process.env.MYSHELL_API_KEY)"

# Test API key format
node -e "console.log('API Key valid format:', /^[a-f0-9]{64}$/.test(process.env.MYSHELL_API_KEY || ''))"

# Test MyShell connection
npm run test-myshell
```

## 💬 Support

**Pentru probleme cu API key-ul MyShell:**
- 🐛 **GitHub Issues:** [Technical Support](https://github.com/Gzeu/profesorXtrader/issues)
- 📚 **MyShell Docs:** [Official Documentation](https://docs.myshell.ai)
- 📧 **Direct:** support@profesorxtrader.com

---

**🚀 Ready pentru MyShell AI Integration!**