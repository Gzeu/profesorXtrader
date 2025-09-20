'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, TrendingDown, DollarSign, PieChart, Settings, Shield } from 'lucide-react'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Profesor<span className="text-primary">X</span>Trader
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            Dashboard profesional pentru monitorizarea Binance cu analiză AI avansată și management în timp real al portofoliului
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Badge variant="secondary" className="text-sm">
              🚀 În dezvoltare
            </Badge>
            <Badge variant="outline" className="text-sm">
              v0.1.0
            </Badge>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50 hover:border-border transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balanță Totală</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">$0.00</div>
              <p className="text-xs text-muted-foreground">API încă neconectat</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-border transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PnL 24h</CardTitle>
              <TrendingUp className="h-4 w-4 text-profit" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-muted-foreground">+$0.00</div>
              <p className="text-xs text-profit">+0.00% din ieri</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-border transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Poziții Active</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Spot + Futures</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-border transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status API</CardTitle>
              <Shield className="h-4 w-4 text-loss" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-loss">Offline</div>
              <p className="text-xs text-muted-foreground">Necesită configurare</p>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Monitorizare în Timp Real
              </CardTitle>
              <CardDescription>
                Urmărirea continuă a balanței și pozițiilor tale Binance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 px-3 rounded-md bg-muted/30">
                  <span className="text-sm">Spot Wallet</span>
                  <Badge variant="outline">Pregătit</Badge>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-md bg-muted/30">
                  <span className="text-sm">Futures Wallet</span>
                  <Badge variant="outline">Pregătit</Badge>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-md bg-muted/30">
                  <span className="text-sm">WebSocket Stream</span>
                  <Badge variant="outline">Pregătit</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-profit" />
                Analiză AI Avansată
              </CardTitle>
              <CardDescription>
                Interpretarea mișcărilor pieței cu machine learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 px-3 rounded-md bg-muted/30">
                  <span className="text-sm">Pattern Recognition</span>
                  <Badge variant="secondary">În dezvoltare</Badge>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-md bg-muted/30">
                  <span className="text-sm">Sentiment Analysis</span>
                  <Badge variant="secondary">În dezvoltare</Badge>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-md bg-muted/30">
                  <span className="text-sm">Risk Assessment</span>
                  <Badge variant="secondary">Planificat</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Setup Instructions */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurare Inițială
            </CardTitle>
            <CardDescription>
              Pașii necesari pentru a începe utilizarea dashboard-ului
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Obține API Key-uri Binance</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Creează API key-uri în contul tău Binance cu permisiuni de citire pentru Spot și Futures
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-sm flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-muted-foreground">Configurare Mediu</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Copiază .env.example în .env.local și adaugă API key-urile
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-sm flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-muted-foreground">Testare Conexiune</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Verifică conectivitatea și permisiunile API-ului
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <Button className="flex-1" disabled>
                Configurează API
              </Button>
              <Button variant="outline" disabled>
                Testează Conexiunea
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Dezvoltat de{' '}
            <a 
              href="https://github.com/Gzeu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              George Pricop (Gzeu)
            </a>
          </p>
          <p className="mt-1">
            ProfesorXTrader v0.1.0 - Dashboard Profesional de Trading
          </p>
        </div>
      </div>
    </div>
  )
}
