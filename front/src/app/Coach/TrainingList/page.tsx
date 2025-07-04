'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { Header } from '../../../components/component/Header/Header'
import { Footer } from '../../../components/component/Footer/Footer'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'
import { MenuItemType } from '../../../types/AddMenu'
import { addMenuApi } from '../../../api/AddMenu/AddMenu'
import ProtectedRoute from '../../../components/ProtectedRoute'
import { AccountRole } from '../../../types/account'
import { useAuth } from '../../../contexts/AuthContext'
import { Buttons } from '../../../components/component/Button/Button'
import DifyChatBot from '../../../components/component/ChatBot/DifyChatBot'

const TrainingList = () => {
  const { user } = useAuth()
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const firebase_uid = user?.uid || ''

  // useCallbackでfetchMenuItems関数をメモ化
  const fetchMenuItems = useCallback(async () => {
    try {
      setIsLoading(true)
      if (firebase_uid) {
        const response = await addMenuApi.getAll(firebase_uid)
        setMenuItems(response.items)
      }
    } catch (error) {
      console.error('トレーニングメニュー詳細一覧の取得に失敗しました。', error)
      setError('メニュー一覧の読み込みに失敗しました。再読み込みしてください。')
    } finally {
      setIsLoading(false)
    }
  }, [firebase_uid]) // firebase_uidが変更された時のみ関数を再作成

  // fetchMenuItemsを依存配列に追加
  useEffect(() => {
    fetchMenuItems()
  }, [fetchMenuItems])

  const handleDelete = async (id: string) => {
    if (window.confirm('このメニューを削除してもよろしいですか？')) {
      try {
        await addMenuApi.delete(id)

        fetchMenuItems()
      } catch (error) {
        console.error('トレーニングメニューの削除に失敗しました.', error)
      }
    }
  }

  return (
    <ProtectedRoute requiredRole={AccountRole.COACH} authRequired={true}>
      <div>
        <div className="flex flex-col min-h-screen">
          <Header role="coach">ホーム画面</Header>
          <main>
            <Card>
              <PageTitle>トレーニングメニュー詳細</PageTitle>
              <div className="max-w-4xl mx-auto p-9">
                <div className="flex justify-between px-5 py-2">
                  <h2 className="text-2xl mt-3">[チーム全体]</h2>
                  <p className="text-2xl mt-3">指導者</p>
                </div>
                <div className="bg-gray-200 rounded-lg shadow-lg p-6">
                  <h3 className="border-b border-black text-2xl text-center font-bold py-3 my-6">基礎トレーニング</h3>
                  <div className="text-right mb-3 text-gray-700">
                    登録済みメニュー数：<span className="font-bold">{menuItems.length}</span>件
                  </div>
                  <div className="max-h-[500px] overflow-y-auto pr-4">
                    {isLoading ? (
                      <div className="text-center px-4">読み込む中....</div>
                    ) : error ? (
                      <div className="text-red-500 text-center py-4">{error}</div>
                    ) : menuItems.length === 0 ? (
                      <div className="text-center py-4">メニューがありません</div>
                    ) : (
                      <div className="space-y-6 mt-5 pb-6 border-b border-black">
                        {menuItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-center">
                            <span className="text-lg">・{item.menu}</span>
                            <Buttons height="35px" width="60px" className="p-1" onClick={() => handleDelete(item.id)}>
                              削除
                            </Buttons>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-10 mr-4 text-right">
                    <LinkButtons href="/Coach/AddMenu">追加</LinkButtons>
                  </div>
                </div>
              </div>
            </Card>
          </main>
          <Footer />
          <div className="fixed right-3 top-28 z-50">
            <DifyChatBot firebase_uid={firebase_uid} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default TrainingList
