'use client'

import { Navigation } from '@/components/layout/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bell, Shield, Palette, Database } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className='flex h-screen bg-background'>
      <div className='w-64 border-r bg-card'>
        <div className='p-6'>
          <h1 className='text-2xl font-bold text-primary mb-6'>ProfesorXTrader</h1>
        </div>
        <Navigation />
      </div>

      <div className='flex-1 overflow-auto'>
        <div className='p-6'>
          <div className='mb-6'>
            <h1 className='text-3xl font-bold'>Settings</h1>
            <p className='text-muted-foreground'>Customize your trading experience</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Bell className='w-5 h-5 mr-2' />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-medium'>Price Alerts</div>
                    <div className='text-sm text-muted-foreground'>Get notified when prices reach your targets</div>
                  </div>
                  <Badge variant='default'>Enabled</Badge>
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-medium'>AI Signals</div>
                    <div className='text-sm text-muted-foreground'>Receive AI-generated trading signals</div>
                  </div>
                  <Badge variant='secondary'>Enabled</Badge>
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-medium'>Market News</div>
                    <div className='text-sm text-muted-foreground'>Breaking news and market updates</div>
                  </div>
                  <Badge variant='outline'>Disabled</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Shield className='w-5 h-5 mr-2' />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-medium'>Two-Factor Authentication</div>
                    <div className='text-sm text-muted-foreground'>Add an extra layer of security</div>
                  </div>
                  <Button size='sm' variant='outline'>Setup</Button>
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-medium'>API Key Management</div>
                    <div className='text-sm text-muted-foreground'>Manage your exchange API keys</div>
                  </div>
                  <Button size='sm' variant='outline'>Manage</Button>
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-medium'>Session Timeout</div>
                    <div className='text-sm text-muted-foreground'>Auto-logout after inactivity</div>
                  </div>
                  <Badge variant='secondary'>30 min</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Palette className='w-5 h-5 mr-2' />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-medium'>Theme</div>
                    <div className='text-sm text-muted-foreground'>Choose your preferred theme</div>
                  </div>
                  <Badge variant='default'>System</Badge>
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-medium'>Chart Colors</div>
                    <div className='text-sm text-muted-foreground'>Customize chart color scheme</div>
                  </div>
                  <Button size='sm' variant='outline'>Customize</Button>
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-medium'>Compact Mode</div>
                    <div className='text-sm text-muted-foreground'>Reduce spacing for more data</div>
                  </div>
                  <Badge variant='outline'>Disabled</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Data & Privacy */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Database className='w-5 h-5 mr-2' />
                  Data & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-medium'>Trading History</div>
                    <div className='text-sm text-muted-foreground'>Export your trading data</div>
                  </div>
                  <Button size='sm' variant='outline'>Export</Button>
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-medium'>Analytics</div>
                    <div className='text-sm text-muted-foreground'>Help improve our AI models</div>
                  </div>
                  <Badge variant='default'>Enabled</Badge>
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-medium'>Data Retention</div>
                    <div className='text-sm text-muted-foreground'>How long to keep your data</div>
                  </div>
                  <Badge variant='secondary'>1 year</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Settings */}
          <div className='mt-6 flex justify-end space-x-4'>
            <Button variant='outline'>Reset to Defaults</Button>
            <Button>Save Settings</Button>
          </div>
        </div>
      </div>
    </div>
  )
}