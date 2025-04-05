import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '../app/providers'
import '../styles/globals.css'
import { auth } from '../auth'
import { AuthProvider } from '..//contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '教育サービス',
  description: '教育サービス',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers session={session}>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
