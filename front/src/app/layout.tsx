import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '../app/providers'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Web版野球ノート',
  description: 'Web版野球ノート',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.className} baseball-bg-pattern`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
