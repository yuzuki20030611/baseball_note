'use client'
import React, { useEffect, useState } from 'react'

import { Header } from '../../../../components/component/Header/Header'
import { PageTitle } from '../../../../components/component/Title/PageTitle'
import { Footer } from '../../../../components/component/Footer/Footer'
import { Label } from '../../../../components/component/Label/Label'
import { InfoItem } from '../../../../components/component/InfoItem/InfoItem'
import { Card } from '../../../../components/component/Card/Card'
import { LinkButtons } from '../../../../components/component/Button/LinkButtons'
import ProtectedRoute from '../../../../components/ProtectedRoute'
import { AccountRole } from '../../../../types/account'
import { useParams } from 'next/navigation'
import { NoteDetailResponse } from '../../../../types/note'
import { ReferenceVideo } from '../../../../components/component/video/referenceVideo'
import { MypracticeVideo } from '../../../../components/component/video/mypracticeVideo'
import { noteApi } from '../../../../api/Note/NoteApi'
import { profileApi } from '../../../../api/client/profile/profileApi'

const CoachNoteDetail = () => {
  const params = useParams()
  const note_id = params.note_id as string
  const [playerName, setPlayerName] = useState<string>('選手')
  const [userId, setUserId] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [noteDetail, setNoteDetail] = useState<NoteDetailResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNoteDetail = async () => {
      try {
        setLoading(true)
        if (!note_id) {
          setError('該当するIDが見つかりません')
          setLoading(false)
          return
        }
        const data = await noteApi.getNoteDetail(note_id)
        setNoteDetail(data)
        if (data && data.user_id) {
          setUserId(data.user_id)

          try {
            const ProfileData = await profileApi.getPlayerNameByUserId(data.user_id)
            if (ProfileData && ProfileData.name) {
              setPlayerName(ProfileData.name)
            }
          } catch (profileError) {
            console.error('プロフィール情報の取得に失敗しました', profileError)
          }
        }
      } catch (error: any) {
        console.error('ノート詳細情報の取得に失敗しました', error)
        setError('ノート詳細情報の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }
    fetchNoteDetail()
  }, [note_id])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toISOString().split('T')[0]
    } catch (error: any) {
      return dateString || ''
    }
  }

  return (
    <ProtectedRoute requiredRole={AccountRole.COACH} authRequired={true}>
      <div className="min-h-screen">
        <div className="flex flex-col min-h-screen">
          <Header role="coach">ホーム画面</Header>

          <main className="flex-grow container mx-auto px-6 py-8 overflow-y-auto h-[calc(100vh-200px)]">
            {loading ? (
              <Card>
                <div className="text-center py-10">読み込み中...</div>
              </Card>
            ) : error ? (
              <Card>
                <div className="text-cetner py-10">
                  <LinkButtons href={`/Coach/NoteList/${userId}`}>ノート一覧に戻る</LinkButtons>
                </div>
              </Card>
            ) : !noteDetail ? (
              <Card>
                <div className="text-center py-10">
                  <p className="text-red-500 mb-4">ノートが見つかりません</p>
                  <LinkButtons href={`/Coach/NoteList/${userId}`}>ノート一覧に戻る</LinkButtons>
                </div>
              </Card>
            ) : (
              <Card>
                <PageTitle>{playerName}の野球ノート詳細</PageTitle>
                <div className="max-w-4xl mx-auto p-8">
                  <div className="text-right px-5 py-2">
                    <p className="text-2xl mb-3">指導者</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-10">
                      <div className="text-lg font-semibold">作成日： {formatDate(noteDetail.created_at)}</div>
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
                            label={`${training.training?.menu || '未定'}：`}
                            value={`${training.count}`}
                            type="number"
                          />
                        ))}
                      </div>
                    )}

                    <div className="space-y-2 my-3 py-3">
                      <InfoItem label="体重：" value={noteDetail.weight} type="number" />
                    </div>

                    <div className="space-y-2 my-3 py-3">
                      <InfoItem label="睡眠時間：" value={noteDetail.sleep} type="number" />
                    </div>

                    {noteDetail.practice && (
                      <div className="space-y-2 my-3 py-3">
                        <InfoItem label="その他練習内容：" value={`${noteDetail.practice}`} type="text" />
                      </div>
                    )}

                    {noteDetail.practice_video && (
                      <div className="space-y-2 my-3 py-3">
                        <Label>参考動画：</Label>
                        <ReferenceVideo url={noteDetail.practice_video} title="" />
                      </div>
                    )}

                    {noteDetail.my_video_url && (
                      <div className="space-y-2 my-3 py-3">
                        <Label>練習動画：</Label>
                        <MypracticeVideo src={noteDetail.my_video_url} title="" />
                      </div>
                    )}

                    <div className="space-y-2 my-3 py-3">
                      <InfoItem label="1日の振り返り：" value={noteDetail.looked_day} type="text" />
                    </div>

                    <div className="space-y-2 my-3 py-3 text-center">
                      <LinkButtons href={`/Coach/NoteList/${userId}`}>ノート一覧に戻る</LinkButtons>
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

export default CoachNoteDetail
