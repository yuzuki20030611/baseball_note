import axios from 'axios'
import { CreateAddMenu, MenuItemType } from '../../types/AddMenu'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const addMenuApi = {
  create: async (data: CreateAddMenu) => {
    try {
      const response = await axios.post(`${BASE_URL}/training/menu`, data, {
        headers: {
          'Content-Type': 'application/json', //送信するデータがjson形式であることを伝えている
        },
      })
      console.log('レスポンス', response.data)
      return response.data
    } catch (error) {
      console.error('メニュー追加に失敗しました', error)
    }
  },

  // 一覧取得
  getAll: async (): Promise<{ items: MenuItemType[]; total: number }> => {
    //[]は複数のオブジェクトを取ってくるので配列にする必要がある。
    try {
      const response = await axios.get(`${BASE_URL}/training/menu`)
      return response.data
    } catch (error) {
      console.error('プロフィール一覧の取得に失敗しました', error)
      throw error
    }
  },

  // メニュー削除
  delete: async (id: string) => {
    try {
      await axios.delete(`${BASE_URL}/training/menu/${id}`)
      return true
    } catch (error) {
      console.error('トレーニングメニューの削除に失敗しました', error)
      throw error
    }
  },
}
