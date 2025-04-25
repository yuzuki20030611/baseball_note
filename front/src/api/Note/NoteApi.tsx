import axios from 'axios'
import { CreateNoteRequest, NoteDetailResponse, NoteListResponse, UpdateNoteRequest } from '../../types/note'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const noteApi = {
  // ノート作成の関数
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

  // ログインしているユーザーが作成したノートの一覧を取得
  getLoginUserNote: async (firebase_uid: string): Promise<NoteListResponse> => {
    try {
      const response = await axios.get(`${BASE_URL}/note/get/${firebase_uid}`)
      return response.data
    } catch (error: any) {
      console.error('ノート一覧の取得に失敗しました', error)
      throw error
    }
  },

  // 指定したノートを論理削除で削除する
  deleteNote: async (noteId: string): Promise<boolean> => {
    try {
      await axios.delete(`${BASE_URL}/note/${noteId}`)
      return true
    } catch (error) {
      console.error('ノート削除に失敗しました', error)
      throw error
    }
  },

  // 1つのノートの詳細な情報を全て取得
  getNoteDetail: async (noteId: string): Promise<NoteDetailResponse> => {
    try {
      const response = await axios.get(`${BASE_URL}/note/detail/${noteId}`)
      return response.data
    } catch (error) {
      console.error('ノート詳細の取得に失敗しました', error)
      throw error
    }
  },

  updateNote: async (noteId: string, data: UpdateNoteRequest): Promise<NoteDetailResponse> => {
    try {
      if (!data.firebase_uid) {
        console.error('Firebase UIDが空です')
        throw new Error('認証情報が不足しています')
      }

      const formData = new FormData()

      formData.append('firebase_uid', data.firebase_uid)
      formData.append('theme', data.theme)
      formData.append('assignment', data.assignment)
      formData.append('weight', typeof data.weight === 'number' ? data.weight.toString() : data.weight)
      formData.append('sleep', typeof data.sleep === 'number' ? data.sleep.toString() : data.sleep)
      formData.append('looked_day', data.looked_day)

      // 任意フィールド
      formData.append('practice_video', data.practice_video || '')
      formData.append('practice', data.practice || '')

      // トレーニングデータ
      formData.append('trainings', JSON.stringify(data.trainings))

      // 動画ファイルの処理
      if (data.my_video instanceof File) {
        formData.append('my_video', data.my_video)
      }

      // 動画削除フラグ
      if (data.delete_video) {
        formData.append('delete_video', 'true')
      }

      // APIエンドポイントのURLを確認（バックエンドの実装に依存）
      const response = await axios.put(`${BASE_URL}/note/${noteId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data
    } catch (error: any) {
      if (error.response) {
        console.error('詳細エラー情報:', error.response.data) // 詳細エラーの表示
      }
      console.error('ノート更新エラー:', error)
      throw error
    }
  },
}
