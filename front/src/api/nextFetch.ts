import { getSession } from 'next-auth/react'
import type { NextApiRequest } from 'next'
import { auth } from '@/auth'

type RequestConfig = Pick<NextApiRequest, 'method' | 'url'> & {
  params?: Record<string, any>
  headers?: Record<string, string>
  data?: Record<string, any>
}

export const nextFetch = <T>(config: RequestConfig, options?: RequestInit): Promise<T> & { cancel: () => void } => {
  const controller = new AbortController()
  const { signal } = controller

  const queryString = new URLSearchParams(config.params).toString()

  const fullUrl = new URL(
    `${config.url}${queryString ? `?${queryString}` : ''}`,
    process.env.NEXT_PUBLIC_API_URL
  ).toString()

  const fetchWithAuth = async () => {
    try {
      const isServer = typeof window === 'undefined'
      const session = isServer ? await auth() : await getSession()

      if (!session?.accessToken) {
        throw new Error('認証情報が見つかりません')
      }

      const fetchOptions: RequestInit = {
        ...options,
        method: config.method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
          ...config.headers,
          ...options?.headers,
        },
        signal,
        cache: 'no-store',
        body: config.data instanceof FormData ? config.data : JSON.stringify(config.data),
      }

      if (config.data instanceof FormData) {
        const headers = fetchOptions.headers as Record<string, string>
        delete headers['Content-Type']
      }

      const response = await fetch(fullUrl, fetchOptions)
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        }
      }

      if (response.status === 204) {
        return {
          status: 'success',
          message: '処理が完了しました',
        } as T
      }

      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw {
          status: 0,
          statusText: 'ネットワークエラー',
          data: { message: 'サーバーに接続できません。インターネット接続を確認してください。' },
        }
      }
      throw error
    }
  }

  const promise = fetchWithAuth()

  return Object.assign(promise, {
    cancel: () => controller.abort(),
  })
}

export type ErrorType<Error> = { status: number; statusText: string; data: Error }
export type BodyType<BodyData> = BodyData
