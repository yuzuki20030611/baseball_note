import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '../app/providers'
import '../styles/globals.css'
import { auth } from '../auth'

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
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  )
}
