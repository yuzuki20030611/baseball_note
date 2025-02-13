import React from 'react'

import { Header } from '../../../components/component/Header/Header '
import { Footer } from '../../../components/component/Footer/Footer'
import { FormInput } from '../../../components/component/Input/FormInput'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Label } from '../../../components/component/Label/Label'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'

const EditLogin = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header href="/Coach/Home">ホーム画面</Header>

      <main className="flex-1 flex flex-col items-center p-6 w-full">
        <Card>
          <PageTitle>ログイン情報変更</PageTitle>
          <div className="max-w-4xl mx-auto p-8">
            <div className="text-right pr-5 mr-5">
              <p className="text-2xl mt-3">指導者</p>
            </div>

            <form className="bg-gray-100 p-8 rounded-lg shadow-md w-full max-w-md mt-6">
              <div className="mb-6">
                <Label>メールアドレス：</Label>
                <FormInput defaultValue="email" placeholder="メールアドレスを入力してください" />
              </div>

              <div className="mb-6">
                <Label>パスワード：</Label>
                <FormInput defaultValue="number" placeholder="パスワードを入力してください" type="password" />
              </div>

              <div className="mb-6">
                <Label>確認用パスワード：</Label>
                <FormInput defaultValue="number" placeholder="パスワードを入力してください" type="password" />
              </div>

              <div className="flex justify-center gap-4 mt-10">
                <LinkButtons href="/Coach/LoginDetail">ログイン情報詳細画面に戻る</LinkButtons>
                <LinkButtons href="/Coach/LoginDetail">決定</LinkButtons>
              </div>
            </form>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  )
}

export default EditLogin
