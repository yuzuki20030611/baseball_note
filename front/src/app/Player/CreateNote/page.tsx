'use client'

import React, { ChangeEvent, useEffect, useRef, useState } from 'react'

import { Header } from '../../../components/component/Header/Header'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Footer } from '../../../components/component/Footer/Footer'
import { Label } from '../../../components/component/Label/Label'
import { FullInput } from '../../../components/component/Input/FullInput'
import { RequiredBadge } from '../../../components/component/Label/RequiredBadge'
import { Card } from '../../../components/component/Card/Card'
import { AccountRole } from '../../../types/account'
import ProtectedRoute from '../../../components/ProtectedRoute'
import { useAuth } from '../../../contexts/AuthContext'
import { CreateNoteRequest } from '../../../types/note'
import { Buttons } from '../../../components/component/Button/Button'
import { MenuItemType } from '../../../types/AddMenu'
import { addMenuApi } from '../../../api/AddMenu/AddMenu'
import { NoteValidationErrors, validateNote, validateMyVideo } from '../../validation/CreateNoteValidation'
import { noteApi } from '../../../api/Note/NoteApi'
import { useRouter } from 'next/navigation'
import { ReferenceVideo } from '../../../components/component/video/referenceVideo'
import { MypracticeVideo } from '../../../components/component/video/mypracticeVideo'

const CreateNote = () => {
  const { user } = useAuth()
  const router = useRouter()
  const firebase_uid = user?.uid
  const myVideoInputRef = useRef<HTMLInputElement>(null)
  const [validateError, setValidateError] = useState<NoteValidationErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fetcTrainings, setFetchTrainings] = useState<MenuItemType[]>([])
  const [practiceVideoPreview, setPracticeVideoPreview] = useState<string | null>(null)
  const [myVideoPreview, setMyVideoPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateNoteRequest>({
    firebase_uid: firebase_uid || '', // Firebaseのユーザーuid
    theme: '',
    assignment: '',
    practice_video: '',
    my_video: null,
    weight: 0,
    sleep: 0,
    looked_day: '',
    practice: '',
    trainings: [],
  })

  useEffect(() => {
    const fectchTrainings = async () => {
      try {
        if (!firebase_uid) return

        setIsLoading(true)
        const response = await addMenuApi.getAllMenus()
        setFetchTrainings(response.items)

        if (response.items && response.items.length > 0) {
          setFormData((prev) => ({
            ...prev,
            trainings: response.items.map((item) => ({
              training_id: item.id,
              count: 0,
            })),
          }))
        }
      } catch (error) {
        console.error('トレーニングメニュー取得に失敗しました', error)
        setError('トレーニングメニューの取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }
    if (firebase_uid) {
      fectchTrainings()
    }
  }, [firebase_uid])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // 入力フィールド変更時に対応するエラーをクリア
    setValidateError((prev) => ({
      ...prev,
      [name]: null,
    }))

    // weight と sleep フィールドの処理
    if (name === 'weight' || name === 'sleep') {
      // 数値と小数点のみを許可する前処理
      let numericValue = value.replace(/[^\d.]/g, '')

      // 先頭の0を処理するロジック
      // 1. 入力が "0" だけの場合はそのまま
      // 2. 0で始まり小数点が続く場合（例: "0."）はそのまま
      // 3. 0で始まり別の数字が続く場合（例: "01"）は先頭の0を削除
      if (numericValue.length > 1 && numericValue[0] === '0' && numericValue[1] !== '.') {
        numericValue = numericValue.substring(1)
      }

      setFormData((prev) => ({
        ...prev,
        [name]: numericValue || '0', // 空の場合は '0' に設定
      }))
    } else {
      // その他のフィールドはそのまま
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

  const handleTrainingCountChange = (trainingId: string, count: number) => {
    setFormData((prev) => {
      const existingIndex = prev.trainings.findIndex((t) => t.training_id === trainingId)

      const newTrainings = [...prev.trainings]

      if (existingIndex >= 0) {
        newTrainings[existingIndex] = { training_id: trainingId, count }
      } else {
        newTrainings.push({ training_id: trainingId, count })
      }

      return {
        ...prev,
        trainings: newTrainings,
      }
    })
  }

  const handleMyVideoSelect = () => {
    // 画面上のファイル選択入力欄を参照するための変数
    if (myVideoInputRef.current) {
      myVideoInputRef.current.click()
    }
  }

  const handleMyVideoChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    // 型ガードを追加して、HTMLInputElementの場合のみファイル処理を行う
    if (e.target instanceof HTMLInputElement && e.target.files) {
      const files = e.target.files

      if (files && files.length > 0) {
        const file = files[0]

        // 既存のプレビューURLがある場合は解放
        if (myVideoPreview && myVideoPreview.startsWith('blob:')) {
          URL.revokeObjectURL(myVideoPreview)
        }

        // 新しいプレビューURLを作成
        const localPreviewUrl = URL.createObjectURL(file)

        // フォームデータ更新
        setFormData((prev) => ({
          ...prev,
          my_video: file,
        }))

        // プレビュー状態を更新
        setMyVideoPreview(localPreviewUrl)
      }
    }
  }

  const handleDeleteVideo = () => {
    // プレビューをクリア
    if (myVideoPreview && myVideoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(myVideoPreview)
    }

    setMyVideoPreview(null)

    setFormData((prev) => ({
      ...prev,
      my_video: null,
    }))
    // ファイル入力をリセット
    if (myVideoInputRef.current) {
      myVideoInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // バリデーション
    const validationErrors = validateNote(formData, fetcTrainings)

    // 動画ファイルのバリデーション
    const videoError = validateMyVideo(formData.my_video)
    if (videoError) {
      validationErrors.my_video = videoError
    }

    // エラーがある場合は処理を中止
    if (Object.keys(validationErrors).length > 0) {
      setValidateError(validationErrors)
      setError('入力内容に誤りがあります。各項目を確認してください。')
      return
    }

    try {
      setIsLoading(true)
      // noteApiを呼び出す
      await noteApi.createNote(formData, formData.firebase_uid)
      alert('ノートの作成に成功しました！')
      router.push('/Player/Home')
    } catch (error) {
      console.error('ノート作成に失敗しました', error)
      setError('ノート作成に失敗しました。正しくログインができているか確認した後に再度ノート作成をお試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute requiredRole={AccountRole.PLAYER} authRequired={true}>
      <div className="min-h-screen">
        <div className="flex flex-col min-h-screen">
          <Header role="player">ホーム画面</Header>
          <main className="flex-grow container mx-auto px-6 py-8 overflow-y-auto h-[calc(100vh-200px)]">
            <Card>
              <form onSubmit={handleSubmit}>
                <PageTitle>野球ノート新規作成</PageTitle>
                <div className="max-w-4xl mx-auto p-8">
                  <div className="text-right pr-5 mr-5">
                    <p className="text-2xl mt-3">選手</p>
                  </div>
                  <div className="border border-black rounded-lg p-10 m-5">
                    <div className="space-y-2 mb-3">
                      <Label>
                        1日のテーマ：
                        <RequiredBadge />
                      </Label>
                      <FullInput type="text" name="theme" onChange={handleChange} value={formData.theme} />
                      {validateError.theme && <p className="text-red-500 text-sm">{validateError.theme}</p>}
                    </div>
                    <div className="space-y-2 my-3 py-3">
                      <Label>
                        課題：
                        <RequiredBadge />
                      </Label>
                      <FullInput type="text" name="assignment" onChange={handleChange} value={formData.assignment} />
                      {validateError.assignment && <p className="text-red-500 text-sm">{validateError.assignment}</p>}
                    </div>
                    <div className="space-y-2 mt-3 pt-3">
                      <Label fontSize="18px">基礎トレーニング：</Label>
                      <RequiredBadge />
                      {isLoading ? (
                        <p>トレーニングメニューを読み込み中...</p>
                      ) : (
                        <div className="space-y-4">
                          {fetcTrainings.length === 0 ? (
                            <p>登録されているトレーニングメニューがありません</p>
                          ) : (
                            fetcTrainings.map((fetchTraining) => (
                              <div key={fetchTraining.id} className="flex items-center space-x-4 border-b pb-3">
                                <div className="flex-grow">
                                  <Label fontSize="16px">{fetchTraining.menu}</Label>
                                </div>
                                <div className="w-32">
                                  <FullInput
                                    type="number"
                                    min={0}
                                    value={
                                      formData.trainings.find((t) => t.training_id === fetchTraining.id)?.count || 0
                                    }
                                    onChange={(e) =>
                                      handleTrainingCountChange(fetchTraining.id, parseInt(e.target.value) || 0)
                                    }
                                    className="w-full"
                                  />
                                </div>
                                <div className="w-16">
                                  <Label fontSize="14px">回</Label>
                                </div>
                                {validateError.trainings && (
                                  <p className="text-red-500 text-sm">{validateError.trainings}</p>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 my-3 py-3">
                      <Label>
                        体重：
                        <RequiredBadge />
                      </Label>
                      <div className="flex flex-grow items-center gap-3">
                        <FullInput
                          className="w-24"
                          type="text"
                          step="0.1"
                          name="weight"
                          onChange={handleChange}
                          value={formData.weight}
                        />
                        <p className="text-xl">Kg</p>
                      </div>
                      {validateError.weight && <p className="text-red-500 text-sm">{validateError.weight}</p>}
                    </div>
                    <div className="space-y-2 my-3 py-3">
                      <Label>
                        睡眠時間：
                        <RequiredBadge />
                      </Label>
                      <div className="flex flex-grow items-center gap-3">
                        <FullInput
                          className="w-24"
                          type="text"
                          step="0.1"
                          name="sleep"
                          onChange={handleChange}
                          value={formData.sleep}
                        />
                        <p className="text-xl">時間</p>
                      </div>
                      {validateError.sleep && <p className="text-red-500 text-sm">{validateError.sleep}</p>}
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
                        onChange={handleChange}
                        value={formData.practice}
                      />
                      {validateError.practice && <p className="text-red-500 text-sm">{validateError.practice}</p>}
                    </div>
                    <div className="space-y-2 my-3 py-3">
                      <Label>
                        参考動画：
                        <RequiredBadge variant="optional" />
                      </Label>
                      <FullInput
                        type="text"
                        name="practice_video"
                        onChange={handleChange}
                        value={formData.practice_video}
                        placeholder="YouTubeなどの動画URLを入力してください"
                      />
                      {validateError.practice_video && (
                        <p className="text-red-500 text-sm">{validateError.practice_video}</p>
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
                        id="profileImageInput"
                      />
                      <div className="flex space-x-2 items-center">
                        {!formData.my_video ? (
                          <Buttons width="120px" type="button" onClick={handleMyVideoSelect}>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                  fillRule="evenodd"
                                  d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              動画を選ぶ
                            </span>
                          </Buttons>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="flex-grow p-2 border rounded bg-gray-50">
                              <span className="text-sm">{formData.my_video.name}</span>
                            </div>
                            <div className="flex space-x-2">
                              <Buttons type="button" onClick={handleMyVideoSelect}>
                                変更
                              </Buttons>
                              <Buttons type="button" onClick={handleDeleteVideo}>
                                削除
                              </Buttons>
                            </div>
                          </div>
                        )}
                      </div>
                      {myVideoPreview && (
                        <div className="mt-4" key={myVideoPreview}>
                          <Label>練習動画プレビュー：</Label>
                          <MypracticeVideo src={myVideoPreview} title="" />
                        </div>
                      )}
                      {validateError.my_video && <p className="text-red-500 text-sm">{validateError.my_video}</p>}
                    </div>
                    <div className="space-y-2 my-3 py-3">
                      <Label>
                        1日の振り返り：
                        <RequiredBadge />
                      </Label>
                      <FullInput
                        name="looked_day"
                        onChange={handleChange}
                        value={formData.looked_day}
                        type="textarea"
                        height="300px"
                      />
                      {validateError.looked_day && <p className="text-red-500 text-sm">{validateError.looked_day}</p>}
                    </div>
                    <div className="text-center space-y-2 mb-1">
                      <p className="text-red-400 m-auto p-auto">{error}</p>
                      <Buttons
                        type="submit"
                        fontSize="xl"
                        disabled={isLoading} // ロード中のみ無効化
                      >
                        {isLoading ? '送信中...' : '作成'}
                      </Buttons>
                    </div>
                  </div>
                </div>
              </form>
            </Card>
          </main>
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default CreateNote
