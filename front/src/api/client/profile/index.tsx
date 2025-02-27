import { CreateProfileRequest } from '../../../components/component/type/profile'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const profileApi = {
  create: async (data: CreateProfileRequest, userId: string) => {
    try {
      // 日付の変換
      const formattedBirthday =
        data.birthday instanceof Date ? data.birthday.toISOString().split('T')[0] : data.birthday

      const requestData = {
        user_id: userId,
        name: data.name,
        team_name: data.team_name,
        birthday: formattedBirthday,
        player_dominant: data.player_dominant,
        player_position: data.player_position,
        // 任意の項目
        ...(data.admired_player ? { admired_player: data.admired_player } : {}),
        ...(data.introduction ? { introduction: data.introduction } : {}),
      }

      // デバッグ用でリクエスト情報をログに出力
      console.log('リクエスト先のURL', `${BASE_URL}/profile/`)
      console.log('リクエスト情報', JSON.stringify(requestData, null, 2))
      console.log('user_id値確認:', userId, typeof userId)

      const response = await axios.post(`${BASE_URL}/profile/`, requestData, {
        timeout: 10000, // 10秒のタイムアウト
        headers: {
          'Content-Type': 'application/json', //送信するデータがJSON形式であることをサーバーに伝えている
        },
        withCredentials: false, // CORS関連設定 クッキーなどの認証情報を含めるかどうかを指定している
      })

      console.log('レスポンス', response.data)
      return response.data
    } catch (error: any) {
      console.error('プロフィール作成エラー：', error)

      // エラー詳細を出力
      if (error.response) {
        console.error('レスポンスエラー', {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data,
        })
      }

      if (error.code === 'ERR_NETWORK') {
        throw new Error('APIサーバーに接続できません。サーバーが起動しているか確認してください。')
      } else if (error.response) {
        // サーバーからのレスポンスがある場合
        throw new Error(`プロフィール作成失敗: ${error.response.data.detail || error.response.statusText}`)
      } else {
        // その他のエラー
        throw new Error(`プロフィール作成失敗: ${error.message || '不明なエラー'}`)
      }
    }
  },
  // get: async (userId: string) => {
  //   try {
  //     const response = await axios.get(`${BASE_URL}/profile/${userId}`)
  //     return response.data
  //   } catch (error) {
  //     console.error('Profile creation error:', error)
  //     throw new Error('プロフィールの取得を失敗しました')
  //   }
  // },
  // update: async (profileId: string, data: Partial<CreateProfileRequest>) => {
  //   try {
  //     const response = await axios.put(`${BASE_URL}/profile/${profileId}`, data)
  //     return response.data
  //   } catch (error) {
  //     console.error('Profile update error:', error)
  //     throw new Error('プロフィールの更新を失敗しました')
  //   }
  // },
}
