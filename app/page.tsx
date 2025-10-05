import { Navigation } from '@/components/layout/Navigation'
import FuturesRealtimeDashboard from '@/components/futures/FuturesRealtimeDashboard'

export default function Home() {
  return (
    <div className='flex h-screen bg-background'>
      {/* Sidebar Navigation */}
      <div className='w-64 border-r bg-card'>
        <div className='p-6'>
          <h1 className='text-2xl font-bold text-primary mb-6'>ProfesorXTrader</h1>
        </div>
        <Navigation />
      </div>
      
      {/* Main Content */}
      <div className='flex-1 overflow-auto'>
        <div className='p-6'>
          <FuturesRealtimeDashboard />
        </div>
      </div>
    </div>
  )
}
