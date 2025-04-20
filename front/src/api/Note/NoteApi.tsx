import axios from 'axios'
import { CreateNoteRequest } from '../../types/note'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const noteApi = {
  createNote: async (data: CreateNoteRequest, firebase_uid: string) => {
    if (!firebase_uid) {
      throw new Error('ユーザーが認証されていません')
    }
    try {
      // FormDataを作成
      const formData = new FormData()
      formData.append('firebase_uid', firebase_uid)
      formData.append('theme', data.theme)
      formData.append('assignment', data.assignment)

      // undefinedの可能性があるフィールドは条件付きで追加
      if (data.practice_video) {
        formData.append('practice_video', data.practice_video)
      } else {
        // 空文字列を設定するか、省略するかの選択
        formData.append('practice_video', '')
      }

      // 数値を文字列に変換
      formData.append('weight', data.weight.toString())
      formData.append('sleep', data.sleep.toString())
      formData.append('looked_day', data.looked_day)

      // 任意フィールドの追加
      if (data.practice) {
        formData.append('practice', data.practice)
      } else {
        formData.append('practice', '')
      }

      //トレーニングデータの変換
      const trainingsData = data.trainings.map((t) => ({
        training_id: t.training_id.toString(),
        count: t.count,
      }))
      formData.append('trainings', JSON.stringify(trainingsData))
      // 動画ファイルを追加
      if (data.my_video instanceof File) {
        formData.append('my_video', data.my_video)
      }

      const response = await axios.post(`${BASE_URL}/note/create`, formData, {
        timeout: 300000,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: false, // CORS関連設定
      })

      return response.data
    } catch (error: any) {
      console.error('ノート作成エラー：', error)

      // バックエンドでのエラー詳細を出力
      if (error.response) {
        console.error('レスポンスエラー', {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data,
        })
      }

      // エラーを外部に投げる
      throw error
    }
  },
}
