'use client'

import { SWRConfig } from 'swr'
import NextTopLoader from 'nextjs-toploader'
import { SessionProvider } from 'next-auth/react'
import { Provider } from '../components/ui/provider'

export function Providers({ children, session }: { children: React.ReactNode; session: any }) {
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
