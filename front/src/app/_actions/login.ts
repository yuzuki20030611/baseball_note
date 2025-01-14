'use server'

import { signIn } from '../../auth'

export async function handleGoogleLogin() {
  try {
    const response = await signIn('google')
    return response
  } catch (error) {
    console.error('ログイン中にエラーが発生しました:', error)
    throw error
  }
}
