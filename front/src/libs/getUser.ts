import type { Profile, User } from 'next-auth'

export const getUser = async (profile: Profile, accessToken: string) => {
  if (!profile.sub) {
    throw new Error('profile.sub is required')
  }
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/uid/${profile.sub}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
    if (!res.ok && res.status !== 404) {
      throw new Error(`APIエラー: ${res.status} ${res.statusText}`)
    }
    if (res.ok) {
      const user = await res.json()
      return user as User
    }

  } catch (error) {
    console.error('ユーザー処理エラー:', error)
    throw error
  }
}
