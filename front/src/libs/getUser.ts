interface FirebaseProfile {
  uid: string
  email?: string | null
  displayName?: string | null
}

interface User {
  id: string
  email: string
  name?: string
}

// 🟡 変更: Profile → FirebaseProfile
export const getUser = async (profile: FirebaseProfile, accessToken: string) => {
  // 🟡 変更: profile.sub → profile.uid
  if (!profile.uid) {
    throw new Error('profile.uid is required')
  }
  try {
    // 🟡 変更: profile.sub → profile.uid
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/uid/${profile.uid}`, {
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