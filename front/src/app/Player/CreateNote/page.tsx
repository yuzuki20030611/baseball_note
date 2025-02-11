import React from 'react'

import { Header } from '../../../components/component/Header/Header '
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Footer } from '../../../components/component/Footer/Footer'
import { Label } from '../../../components/component/Label/Label'
import { FullInput } from '../../../components/component/Input/FullInput'
import { RequiredBadge } from '../../../components/component/Label/RequiredBadge'
import { InfoItem } from '../../../components/component/InfoItem/InfoItem'
import { DeleteButton } from '../../../components/component/Button/Delete'
import { FormInput } from '../../../components/component/Input/FormInput'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'

const CreateNote = () => {
  return (
    <div className="min-h-screen">
      <div className="flex flex-col min-h-screen">
        <Header href="/Player/Home">ホーム画面</Header>
        <main className="flex-grow container mx-auto px-6 py-8 overflow-y-auto h-[calc(100vh-200px)]">
          <Card>
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
                  <FullInput />
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    課題：
                    <RequiredBadge />
                  </Label>
                  <FullInput />
                </div>
                <div className="space-y-2 mt-3 pt-3">
                  <Label>基礎トレーニング：</Label>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    腕立て：
                    <RequiredBadge />
                  </Label>
                  <div className="flex flex-grow items-center gap-3">
                    <FormInput type="number" maxWidth="100px" />
                    <p className="text-2xl">回</p>
                  </div>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    腹筋：
                    <RequiredBadge />
                  </Label>
                  <div className="flex flex-grow items-center gap-3">
                    <FormInput type="number" maxWidth="100px" />
                    <p className="text-2xl">回</p>
                  </div>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    背筋：
                    <RequiredBadge />
                  </Label>
                  <div className="flex flex-grow items-center gap-2">
                    <FormInput type="number" maxWidth="100px" />
                    <p className="text-2xl">回</p>
                  </div>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    バットスイング：
                    <RequiredBadge />
                  </Label>
                  <div className="flex flex-grow items-center gap-3">
                    <FormInput type="number" maxWidth="100px" />
                    <p className="text-xl">スイング</p>
                  </div>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    ランニング：
                    <RequiredBadge />
                  </Label>
                  <div className="flex flex-grow items-center gap-3">
                    <FormInput type="number" maxWidth="100px" />
                    <p className="text-xl">Km</p>
                  </div>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    体重：
                    <RequiredBadge />
                  </Label>
                  <div className="flex flex-grow items-center gap-3">
                    <FormInput type="number" maxWidth="100px" />
                    <p className="text-xl">Kg</p>
                  </div>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    睡眠時間：
                    <RequiredBadge />
                  </Label>
                  <div className="flex flex-grow items-center gap-3">
                    <FormInput type="number" maxWidth="100px" />
                    <p className="text-xl">時間</p>
                  </div>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    その他練習内容：
                    <RequiredBadge variant="optional" />
                  </Label>
                  <FullInput type="textarea" height="200px" />
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    参考動画：
                    <RequiredBadge variant="optional" />
                  </Label>
                  <FullInput />
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    練習動画：
                    <RequiredBadge variant="optional" />
                  </Label>
                  <InfoItem
                    label={
                      <div className="border border-blue-400 rounded inline-block">
                        <DeleteButton fontSize="19px">選ぶ</DeleteButton>
                      </div>
                    }
                  />
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    1日の振り返り：
                    <RequiredBadge />
                  </Label>
                  <FullInput type="textarea" height="300px" />
                </div>
                <div className="text-center space-y-2 mb-1">
                  <LinkButtons href="/Player/Home" className="mt-4 text-xl">
                    作成
                  </LinkButtons>
                </div>
              </div>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default CreateNote
