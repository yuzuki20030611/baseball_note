'use client'

import React, { useEffect, useState } from 'react'

import { Header } from '../../../../components/component/Header/Header'
import { PageTitle } from '../../../../components/component/Title/PageTitle'
import { Buttons } from '../../../../components/component/Button/Button'
import { Footer } from '../../../../components/component/Footer/Footer'
import { Label } from '../../../../components/component/Label/Label'
import { InfoItem } from '../../../../components/component/InfoItem/InfoItem'
import { Card } from '../../../../components/component/Card/Card'
import { LinkButtons } from '../../../../components/component/Button/LinkButtons'
import ProtectedRoute from '../../../../components/ProtectedRoute'
import { AccountRole } from '../../../../types/account'
import { useParams, useRouter } from 'next/navigation'
import { NoteDetailResponse } from '../../../../types/note'
import { noteApi } from '../../../../api/Note/NoteApi'
import { VideoPlayer } from '../../../../components/component/video/videoDisplay'
import { SimpleVideoEmbed } from '../../../../components/component/video/practiceVideo'

const PlayerNoteDetail = () => {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string //idを文字列で取得

  const [noteDetail, setNoteDetail] = useState<NoteDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 画面表示の際にノート情報を取得
  useEffect(() => {
    const fetchNoteDetail = async () => {
      try {
        setLoading(true)
        setError(null)
        if (!id) {
          setError('該当するIDが見つかりません')
          setLoading(false)
          return
        }
        const data = await noteApi.getNoteDetail(id)
        setNoteDetail(data)
      } catch (error) {
        console.error('ノート詳細取得エラー', error)
        setError('ノート詳細の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }
    fetchNoteDetail()
  }, [id])

  // ノート削除の関数
  const handleDelete = async () => {
    if (!id) return

    if (window.confirm('このノートを削除してもよろしいでしょうか？')) {
      try {
        await noteApi.deleteNote(id)
        alert('ノートの削除に成功しました')
        router.push('/Player/Home')
      } catch (error) {
        console.error('ノートの削除に失敗しました', error)
        alert('ノートの削除に失敗しました')
      }
    }
  }

  // created_atをdate型で表示するための関数
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toISOString().split('T')[0]
    } catch (error) {
      return dateString || ''
    }
  }

  return (
    <ProtectedRoute requiredRole={AccountRole.PLAYER} authRequired={true}>
      <div className="min-h-screen">
        <div className="flex flex-col min-h-screen">
          <Header role="player">ホーム画面</Header>

          <main className="flex-grow container mx-auto px-6 py-8 overflow-y-auto h-[calc(100vh-200px)]">
            {loading ? (
              <Card>
                <div className="text-center py-10">読み込み中...</div>
              </Card>
            ) : error || !noteDetail ? (
              <Card>
                <div className="text-center py-10">
                  <p className="text-red-500 mb-4">{error || 'ノートが見つかりません'}</p>
                  <LinkButtons href="/Player/Home">ホームに戻る</LinkButtons>
                </div>
              </Card>
            ) : (
              <Card>
                <PageTitle>野球ノート詳細</PageTitle>
                <div className="max-w-4xl mx-auto p-8">
                  <div className="text-right pr-5 mr-5">
                    <p className="text-2xl mt-3">選手</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-10">
                      <div className="text-xl font-semibold">作成日時：{formatDate(noteDetail.created_at)}</div>
                      <div className="space-x-3">
                        <LinkButtons href={`/Player/EditNote/${id}`} className="text-lg">
                          編集
                        </LinkButtons>
                        <Buttons fontSize="18px" onClick={handleDelete}>
                          削除
                        </Buttons>
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <InfoItem label="1日のテーマ：" value={noteDetail.theme} type="text" />
                    </div>
                    <div className="space-y-2 my-3 py-3">
                      <InfoItem label="課題：" value={noteDetail.assignment} type="text" />
                    </div>
                    {noteDetail.training_notes && noteDetail.training_notes.length > 0 && (
                      <div className="space-y-2 my-3 py-3">
                        <Label>基礎トレーニング：</Label>
                        {noteDetail.training_notes.map((training) => (
                          <InfoItem
                            key={training.id}
                            label={`${training.training?.menu || '未定'}:`}
                            value={`${training.count}`}
                            type="number"
                          />
                        ))}
                      </div>
                    )}

                    <div className="space-y-2 my-3 py-3">
                      <InfoItem label="体重：" value={`${noteDetail.weight}Kg`} type="number" />
                    </div>
                    <div className="space-y-2 my-3 py-3">
                      <InfoItem label="睡眠時間：" value={`${noteDetail.sleep}時間`} type="number" />
                    </div>
                    {noteDetail.practice && (
                      <div className="space-y-2 my-3 py-3">
                        <InfoItem label="その他練習内容：" value={`${noteDetail.practice}`} type="text" />
                      </div>
                    )}

                    {noteDetail.practice_video && (
                      <div className="space-y-2 my-3 py-3">
                        <Label>参考動画：</Label>
                        <SimpleVideoEmbed url={noteDetail.practice_video} title="" />
                      </div>
                    )}

                    {noteDetail && noteDetail.my_video_url && (
                      <div className="space-y-2 my-3 py-3">
                        <Label>練習動画：</Label>
                        <VideoPlayer src={noteDetail.my_video_url} title="" />
                      </div>
                    )}

                    <div className="space-y-2 my-3 py-3">
                      <InfoItem label="1日の振り返り：" value={noteDetail.looked_day} type="text" />
                    </div>

                    <div className="text-center mt-6 flex justify-center space-x-4 py-1 my-2">
                      <LinkButtons href="/Player/Chat"> 💬 監督とチャットする</LinkButtons>
                      <LinkButtons href="/Player/Home">ノート一覧に戻る</LinkButtons>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </main>
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default PlayerNoteDetail
