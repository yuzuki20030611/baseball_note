import React from 'react'

import { Header } from '../../../components/component/Header/Header '
import { Footer } from '../../../components/component/Footer/Footer'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Label } from '../../../components/component/Label/Label'
import { FormInput } from '../../../components/component/Input/FormInput'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'

const AddMenu = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header href="/Coach/Home">ホーム画面</Header>

      <main className="max-w-4xl mx-auto p-6 w-full">
        <Card>
          <PageTitle>トレーニングメニュー追加</PageTitle>
          <div className="space-y-6">
            <div className="mt-14">
              <Label fontSize="24px">トレーニング名： </Label>
              <FormInput type="text" className="w-full border border-gray-300 rounded p-2" />
            </div>
            <div className="flex justify-center space-x-4 pt-10 pb-4">
              <LinkButtons href="/Coach/TrainingList">トレーニング一覧に戻る</LinkButtons>
              <LinkButtons href="/Coach/TrainingList">追加する</LinkButtons>
            </div>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  )
}

export default AddMenu
