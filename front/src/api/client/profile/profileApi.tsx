import { CreateProfileRequest } from '../../../types/profile'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const profileApi = {
  create: async (data: CreateProfileRequest, userId: string) => {
    try {
      // 日付の変換
      const formattedBirthday =
        data.birthday instanceof Date ? data.birthday.toISOString().split('T')[0] : data.birthday

      const formData = new FormData()
      formData.append('user_id', userId)
      formData.append('name', data.name)
      formData.append('team_name', data.team_name)
      formData.append('birthday', formattedBirthday)
      formData.append('player_dominant', data.player_dominant)
      formData.append('player_position', data.player_position)
      //任意の項目
      if (data.admired_player) {
        formData.append('admired_player', data.admired_player)
      }
      if (data.introduction) {
        formData.append('introduction', data.introduction)
      }
      if (data.image instanceof File) {
        formData.append('image', data.image)
      }

      const response = await axios.post(`${BASE_URL}/profile/`, formData, {
        timeout: 10000, // 10秒のタイムアウト
        headers: {
          'Content-Type': 'multipart/form-data', //リクエストの本文（body）が multipart/form-data 形式であることをサーバーに伝えています。
        },
        withCredentials: false, // CORS関連設定 クッキーなどの認証情報を含めるかどうかを指定している
      })

      return response.data
    } catch (error: any) {
      console.error('プロフィール作成エラー：', error)

      // バックエンドでのエラー詳細を出力
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
  get: async (userId: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/profile/${userId}`)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null
      }

      // バックエンドでのエラー詳細を出力（デバッグに役立つ）
      if (error.response) {
        console.error('サーバーエラー詳細:', {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data,
        })
      }
      if (error.code === 'ERR_NETWORK') {
        throw new Error('APIサーバーに接続することができません。サーバーが接続されているか確認してください')
      } else if (error.response) {
        throw new Error(`プロフィール取得失敗: ${error.response.data.detail || error.response.statusText}`)
      } else {
        // その他のエラー
        throw new Error(`プロフィール取得失敗: ${error.message || '不明なエラー'}`)
      }
    }
  },
  update: async (profileId: string, data: Partial<CreateProfileRequest>) => {
    try {
      const formData = new FormData()

      if (data.name !== undefined) formData.append('name', data.name)
      if (data.team_name !== undefined) formData.append('team_name', data.team_name)

      if (data.birthday !== undefined) {
        const formattedBirthday =
          data.birthday instanceof Date ? data.birthday.toISOString().split('T')[0] : data.birthday
        formData.append('birthday', formattedBirthday)
      }

      if (data.player_dominant !== undefined) formData.append('player_dominant', data.player_dominant)
      if (data.player_position !== undefined) formData.append('player_position', data.player_position)
      if (data.admired_player !== undefined) formData.append('admired_player', data.admired_player)
      if (data.introduction !== undefined) formData.append('introduction', data.introduction)
      if (data.image instanceof File) {
        formData.append('image', data.image)
      }

      const response = await axios.put(`${BASE_URL}/profile/${profileId}`, formData, {
        timeout: 10000,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: false,
      })
      return response.data
    } catch (error: any) {
      console.error('プロフィール更新エラー:', error)

      // バックエンドでのエラー詳細を出力
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
        throw new Error(`プロフィール更新失敗: ${error.response.data.detail || error.response.statusText}`)
      } else {
        // その他のエラー
        throw new Error(`プロフィール更新失敗: ${error.message || '不明なエラー'}`)
      }
    }
  },
}
