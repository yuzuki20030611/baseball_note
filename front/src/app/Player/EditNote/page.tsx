'use client'

import React, { ChangeEvent, FormEvent, Suspense, useCallback, useEffect, useRef, useState } from 'react'

import { Header } from '../../../components/component/Header/Header'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Footer } from '../../../components/component/Footer/Footer'
import { Label } from '../../../components/component/Label/Label'
import { FullInput } from '../../../components/component/Input/FullInput'
import { RequiredBadge } from '../../../components/component/Label/RequiredBadge'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'
import ProtectedRoute from '../../../components/ProtectedRoute'
import { AccountRole } from '../../../types/account'
import { useRouter, useSearchParams } from 'next/navigation'
import { NoteDetailResponse, UpdateNoteRequest } from '../../../types/note'
import { noteApi } from '../../../api/Note/NoteApi'
import { Buttons } from '../../../components/component/Button/Button'
import { ReferenceVideo } from '../../../components/component/video/referenceVideo'
import { MypracticeVideo } from '../../../components/component/video/mypracticeVideo'
import { useAuth } from '../../../contexts/AuthContext'
import { NoteValidationErrors, validateEditNote, validateMyVideo } from '../../validation/CreateNoteValidation'

function EditNoteContent() {
  const { user } = useAuth()
  const firebase_uid = user?.uid
  const searchParams = useSearchParams()
  const router = useRouter()
  const note_id = searchParams.get('id')
  const myVideoInputRef = useRef<HTMLInputElement>(null)

  const [noteDetail, setNoteDetail] = useState<NoteDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<NoteValidationErrors>({})
  const [myVideoError, setMyVideoError] = useState<string | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // 動画プレビュー用の状態
  const [practiceVideoPreview, setPracticeVideoPreview] = useState<string | null>(null)
  const [myVideoPreview, setMyVideoPreview] = useState<string | null>(null)
  // 動画の状態表示用テキスト
  const [myVideoStatusText, setMyVideoStatusText] = useState<string>('')

  // フォームデータ状態
  const [formData, setFormData] = useState<UpdateNoteRequest>({
    firebase_uid: firebase_uid || '', // Firebaseのユーザーuid
    theme: '',
    assignment: '',
    weight: 0,
    sleep: 0,
    looked_day: '',
    delete_video: false,
    practice: '',
    practice_video: '',
    my_video: null,
    trainings: [],
  })

  // fetchNoteDetail関数をuseCallbackでメモ化
  const fetchNoteDetail = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      if (!note_id) {
        setError('ノートIDが指定されていません')
        setLoading(false)
        return
      }
      const data = await noteApi.getNoteDetail(note_id)
      setNoteDetail(data)

      // フォームデータを初期化
      setFormData({
        firebase_uid: firebase_uid || '', // Firebaseのユーザーuid
        theme: data.theme,
        assignment: data.assignment,
        weight: data.weight,
        sleep: data.sleep,
        looked_day: data.looked_day,
        practice: data.practice || '',
        practice_video: data.practice_video || '',
        my_video: null,
        trainings: data.training_notes.map((t) => ({
          training_id: t.training_id,
          count: t.count,
        })),
      })
      // 初期プレビューの設定(参考動画)
      if (data.practice_video) {
        setPracticeVideoPreview(data.practice_video)
      }

      // 練習動画の初期設定
      if (data.my_video) {
        setMyVideoStatusText(`現在の動画: ${data.my_video.split('/').pop()}`)
        if (data.my_video_url) {
          setMyVideoPreview(data.my_video_url)
        }
      } else {
        setMyVideoStatusText('動画が選択されていません')
      }
    } catch (error) {
      console.error('ノート詳細取得エラー', error)
      setError('ノート詳細の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [note_id, firebase_uid]) // note_idとfirebase_uidが変更された時のみ関数を再作成

  // 画面表示の際にノート情報を取得
  useEffect(() => {
    fetchNoteDetail()
  }, [fetchNoteDetail]) // fetchNoteDetailを依存配列に追加

  // ローカルプレビューのクリーンアップ（不必要なメモリを削除）
  useEffect(() => {
    return () => {
      // コンポーネントがアンマウントされる時のクリーンアップ
      if (myVideoPreview && myVideoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(myVideoPreview)
      }
    }
  }, [myVideoPreview]) // myVideoPreviewを依存配列に追加

  // 入力変更ハンドラ
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    // エラーをクリア
    setValidationErrors((prev) => ({
      ...prev,
      [name]: null,
    }))

    if (type === 'number') {
      // number型の入力フィールドの場合（weight, sleep）
      // 空文字の場合は0、それ以外は数値に変換
      const numValue = value === '' ? 0 : parseFloat(value)

      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }))
    } else {
      // その他のテキストフィールドはそのまま
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))

      // 参考動画URLが変更された際に、プレビューも更新
      if (name === 'practice_video') {
        setPracticeVideoPreview(value || null)
      }
    }
  }

  // トレーニング回数変更ハンドラ
  const handleTrainingChange = (trainingId: string, count: number) => {
    // トレーニング関連のエラーをクリア
    setValidationErrors((prev) => ({
      ...prev,
      trainings: null,
    }))

    setFormData((prev) => {
      const updatedTrainings = prev.trainings.map((t) => (t.training_id === trainingId ? { ...t, count } : t))
      return {
        ...prev,
        trainings: updatedTrainings,
      }
    })
  }

  // 動画選択ハンドラ
  const handleMyVideoSelect = () => {
    if (myVideoInputRef.current) {
      myVideoInputRef.current.value = ''
      myVideoInputRef.current.click()
    }
  }

  // 動画ファイル変更ハンドラ
  const handleMyVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMyVideoError(undefined)
      const file = e.target.files[0]

      // 既存のプレビューURLがある場合は常に解放
      if (myVideoPreview && myVideoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(myVideoPreview)
      }

      // 新しいプレビューURLを作成
      const localPreviewUrl = URL.createObjectURL(file)

      setFormData((prev) => ({
        ...prev,
        my_video: file,
        delete_video: false,
      }))

      // プレビュー状態を更新
      setMyVideoPreview(localPreviewUrl)
      setMyVideoStatusText(`選択中の動画: ${file.name}`)
    }
  }
  // 動画削除ハンドラ
  const handleDeleteVideo = () => {
    if (window.confirm('本当に動画を削除しますか？')) {
      setFormData((prev) => ({
        ...prev,
        my_video: null,
        delete_video: true,
      }))
      // プレビューをクリア
      if (myVideoPreview && myVideoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(myVideoPreview)
      }
      setMyVideoPreview(null)
      setMyVideoStatusText('動画が選択されていません')

      if (myVideoInputRef.current) {
        myVideoInputRef.current.value = ''
      }
      alert('動画の削除に成功しました')
    }
  }

  // フォーム送信ハンドラ
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // firebase_uidが空の場合は更新
    if (!formData.firebase_uid && firebase_uid) {
      setFormData((prev) => ({
        ...prev,
        firebase_uid: firebase_uid,
      }))
    }

    // firebase_uidがまだ空の場合はエラーを表示して処理を中止
    if (!formData.firebase_uid) {
      setError('認証情報が取得できません。再度ログインしてください。')
      setIsSubmitting(false)
      return
    }

    const noteErrors = validateEditNote(
      formData,
      noteDetail?.training_notes.map((tn) => ({
        //必要な値だけを渡したいので、引数に各値をオブジェクト型で渡せるようにしている。
        id: tn.training_id,
        menu: tn.training?.menu || '',
      })) || []
    )
    const videoError = validateMyVideo(formData.my_video)

    setValidationErrors(noteErrors)
    setMyVideoError(videoError)

    if (Object.keys(noteErrors).length > 0 || videoError) {
      setIsSubmitting(false)
      return
    }

    try {
      setError(null)
      // note_idの型安全性チェック
      if (!note_id) {
        setError('ノートIDが取得できません')
        setIsSubmitting(false)
        return
      }

      await noteApi.updateNote(note_id, {
        ...formData,
      })

      alert('ノートの更新に成功しました！')
      router.push(`/Player/NoteDetail?id=${note_id}`)
    } catch (error) {
      console.error('ノート更新エラー', error)
      setError('ノートの更新に失敗しました')
    } finally {
      setIsSubmitting(false)
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
            ) : !noteDetail ? (
              <Card>
                <div className="text-center py-10">
                  <p className="text-red-500 mb-4">{error || 'ノートが見つかりません'}</p>
                  <LinkButtons href="/Player/Home">ホームに戻る</LinkButtons>
                </div>
              </Card>
            ) : (
              <Card>
                <PageTitle>野球ノート編集</PageTitle>
                <div className="max-w-4xl mx-auto p-8">
                  <div className="text-right pr-5 mr-5">
                    <p className="text-3xl mt-4">選手</p>
                  </div>
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleSubmit}>
                    <div className="rounded-xl p-10 m-5 bg-gray-100">
                      <div className="space-y-2 mb-3">
                        <Label>
                          1日のテーマ：
                          <RequiredBadge />
                        </Label>
                        <FullInput name="theme" value={formData.theme} onChange={handleChange} />
                        {validationErrors.theme && <p className="text-red-500 text-sm">{validationErrors.theme}</p>}
                      </div>
                      <div className="space-y-2 my-3 py-3">
                        <Label>
                          課題：
                          <RequiredBadge />
                        </Label>
                        <FullInput name="assignment" value={formData.assignment} onChange={handleChange} />
                        {validationErrors.assignment && (
                          <p className="text-red-500 text-sm">{validationErrors.assignment}</p>
                        )}
                      </div>
                      <div className="space-y-2 mt-3 pt-3">
                        <Label>基礎トレーニング：</Label>
                        <RequiredBadge />
                      </div>
                      {noteDetail?.training_notes && noteDetail.training_notes.length > 0 ? (
                        noteDetail.training_notes.map((training) => (
                          <div key={training.id} className="flex items-center space-x-4 border-b pt-3 mb-2">
                            <div className="flex-grow">
                              <Label fontSize="16px">{training.training?.menu}</Label>
                            </div>
                            <div className="w-32 pb-2">
                              <FullInput
                                type="number"
                                className="w-full"
                                value={
                                  formData.trainings.find((t) => t.training_id === training.training_id)?.count || 0
                                }
                                onChange={(e) =>
                                  handleTrainingChange(training.training_id, parseInt(e.target.value) || 0)
                                }
                              />
                            </div>
                            <div className="w-16">
                              <Label fontSize="20px">回</Label>
                            </div>

                            {validationErrors.trainings && (
                              <p className="text-red-500 text-sm">{validationErrors.trainings}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p>登録されているトレーニングがありません</p>
                      )}
                      <div className="space-y-2 my-3 py-3">
                        <Label>
                          体重：
                          <RequiredBadge />
                        </Label>
                        <div className="flex flex-grow items-center gap-3">
                          <FullInput
                            className="w-24"
                            type="number"
                            name="weight"
                            step="0.1"
                            value={formData.weight}
                            onChange={handleChange}
                          />
                          <p className="text-xl">kg</p>
                        </div>
                        {validationErrors.weight && <p className="text-red-500 text-sm">{validationErrors.weight}</p>}
                      </div>
                      <div className="space-y-2 my-3 py-3">
                        <Label>
                          睡眠時間：
                          <RequiredBadge />
                        </Label>
                        <div className="flex flex-grow items-center gap-3">
                          <FullInput
                            className="w-24"
                            type="number"
                            name="sleep"
                            step="0.1"
                            value={formData.sleep}
                            onChange={handleChange}
                          />
                          <p className="text-xl">時間</p>
                        </div>
                        {validationErrors.sleep && <p className="text-red-500 text-sm">{validationErrors.sleep}</p>}
                      </div>
                      <div className="space-y-2 my-3 py-3">
                        <Label>
                          その他練習内容：
                          <RequiredBadge variant="optional" />
                        </Label>
                        <FullInput
                          type="textarea"
                          height="200px"
                          name="practice"
                          value={formData.practice}
                          onChange={handleChange}
                        />
                        {validationErrors.practice && (
                          <p className="text-red-500 text-sm">{validationErrors.practice}</p>
                        )}
                      </div>
                      <div className="space-y-2 my-3 py-3">
                        <Label>
                          参考動画：
                          <RequiredBadge variant="optional" />
                        </Label>
                        <FullInput
                          value={formData.practice_video}
                          name="practice_video"
                          placeholder="YouTubeなどの動画URLを入力してください"
                          onChange={handleChange}
                        />
                        {validationErrors.practice_video && (
                          <p className="text-red-500 text-sm">{validationErrors.practice_video}</p>
                        )}
                        {practiceVideoPreview && (
                          <div className="mt-4">
                            <Label>参考動画プレビュー：</Label>
                            <ReferenceVideo url={practiceVideoPreview} title="" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 my-3 py-3">
                        <Label>
                          練習動画：
                          <RequiredBadge variant="optional" />
                        </Label>
                        <input
                          type="file"
                          ref={myVideoInputRef}
                          accept="video/*"
                          className="hidden"
                          name="my_video"
                          onChange={handleMyVideoChange}
                        />
                        <div className="flex items-center space-x-2">
                          <div className="flex-grow p-2 border rounded bg-gray-50">
                            <span className="text-sm">{myVideoStatusText}</span>
                          </div>
                          <Buttons type="button" onClick={handleMyVideoSelect}>
                            {formData.my_video || (!formData.delete_video && noteDetail.my_video) ? '変更' : '選択'}
                          </Buttons>
                          {(formData.my_video || (!formData.delete_video && noteDetail.my_video)) && (
                            <Buttons type="button" onClick={handleDeleteVideo}>
                              削除
                            </Buttons>
                          )}
                        </div>
                        {/* 動画プレビュー */}
                        {myVideoPreview && (
                          <div className="mt-4" key={myVideoPreview}>
                            <Label>練習動画プレビュー：</Label>
                            <MypracticeVideo src={myVideoPreview} title="" />
                          </div>
                        )}
                        {myVideoError && <p className="text-red-500 text-sm">{myVideoError}</p>}
                      </div>
                      <div className="space-y-2 my-3 py-3">
                        <Label>
                          1日の振り返り：
                          <RequiredBadge />
                        </Label>
                        <FullInput
                          name="looked_day"
                          type="textarea"
                          height="300px"
                          value={formData.looked_day}
                          onChange={handleChange}
                        />
                        {validationErrors.looked_day && (
                          <p className="text-red-500 text-sm">{validationErrors.looked_day}</p>
                        )}
                      </div>
                      <div className="flex justify-center space-x-5 mt-5">
                        <LinkButtons href={`/Player/NoteDetail?id=${note_id}`} className="text-lg">
                          詳細画面に戻る
                        </LinkButtons>
                        <Buttons type="submit" className="text-lg" disabled={isSubmitting}>
                          {isSubmitting ? '更新中...' : '更新'}
                        </Buttons>
                      </div>
                    </div>
                  </form>
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

// 🔄 変更点8: Suspenseラッパーコンポーネント
const EditNote = () => {
  return (
    <ProtectedRoute requiredRole={AccountRole.PLAYER} authRequired={true}>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <EditNoteContent />
      </Suspense>
    </ProtectedRoute>
  )
}

export default EditNote
