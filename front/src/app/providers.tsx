'use client'

import { SWRConfig } from 'swr'
import NextTopLoader from 'nextjs-toploader'
import { Provider } from '../components/ui/provider'
import { AuthProvider } from '../contexts/AuthContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <SWRConfig
        value={{
          dedupingInterval: 0, // キャッシュ時間を0に設定
          provider: () => new Map(), // 新しいMapを毎回作成
        }}
      >
        <NextTopLoader color="#d53f8c92" height={2} showSpinner={false} />
        <AuthProvider>{children}</AuthProvider>
      </SWRConfig>
    </Provider>
  )
}
