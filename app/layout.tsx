import type { Metadata } from 'next'
import './globals.css'
import { OrderProvider } from '@/context/OrderContext'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Brew & Go - Pre-order Coffee',
  description: 'Order ahead and skip the line',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <OrderProvider>
          {children}
          <Toaster position="top-center" />
        </OrderProvider>
      </body>
    </html>
  )
}