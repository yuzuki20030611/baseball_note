import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '../app/providers'
import '../styles/globals.css'
import { auth } from '../auth'

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
  const session = await auth()
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.className} baseball-bg-pattern`}>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  )
}
