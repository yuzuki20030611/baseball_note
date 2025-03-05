import React from 'react'

import { Header } from '../../components/component/Header/Header'
import { Footer } from '../../components/component/Footer/Footer'
import { FormInput } from '../../components/component/Input/FormInput'
import { PageTitle } from '../../components/component/Title/PageTitle'
import { Label } from '../../components/component/Label/Label'
import { Card } from '../../components/component/Card/Card'
import { LinkButtons } from '../../components/component/Button/LinkButtons'

const CreateAccount = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header>ログアウト</Header>

      <main className="bg-white flex-1 flex flex-col items-center p-8 w-full">
        <Card>
          <PageTitle>新規登録画面</PageTitle>

          <form className="bg-gray-100 p-8 rounded-lg shadow-sm w-full max-w-md mt-6">
            <div className="mb-6">
              <Label>メールアドレス：</Label>
              <FormInput placeholder="メールアドレスを入力してください" type="email" />
            </div>

            <div className="mb-6">
              <Label>パスワード：</Label>
              <FormInput placeholder="パスワードを入力してください" type="password" />
            </div>

            <div className="mb-6">
              <Label>パスワード（再入力）：</Label>
              <FormInput placeholder="確認用パスワードを入力してください" type="password" />
            </div>

            <div className="flex justify-center mt-6">
              <LinkButtons className="text-xl" href="/">
                新規登録
              </LinkButtons>
            </div>
          </form>
        </Card>
      </main>

      <Footer />
    </div>
  )
}

export default CreateAccount
