'use client'

import { SWRConfig } from 'swr'
import NextTopLoader from 'nextjs-toploader'
import { SessionProvider } from 'next-auth/react'
import { auth } from '../auth'
import { Provider } from '../components/ui/provider'

export async function Providers({ children }: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <SessionProvider session={session}>
      <Provider>
        <SWRConfig
          value={{
            dedupingInterval: 0, // キャッシュ時間を0に設定
            provider: () => new Map(), // 新しいMapを毎回作成
          }}
        >
          <NextTopLoader color="#d53f8c92" height={2} showSpinner={false} />
          {children}
        </SWRConfig>
      </Provider>
    </SessionProvider>
  )
}
