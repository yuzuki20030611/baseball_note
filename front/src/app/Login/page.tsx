import React from 'react'

import { Header } from '../../components/component/Header/Header'
import { Footer } from '../../components/component/Footer/Footer'
import { FormInput } from '../../components/component/Input/FormInput'
import { PageTitle } from '../../components/component/Title/PageTitle'
import { Label } from '../../components/component/Label/Label'
import { Card } from '../../components/component/Card/Card'
import { LinkButton } from '../../components/component/Button/LoginPageButton'
import { LinkButtons } from '@/components/component/Button/LinkButtons'

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header>ログアウト</Header>
      <main className="bg-white flex-1 flex flex-col items-center p-8 w-full">
        <Card>
          <PageTitle>野球ノート</PageTitle>

          <form className="bg-gray-100 p-8 rounded-lg shadow-md w-full max-w-md mt-6">
            <div className="mb-6">
              <Label>メールアドレス：</Label>
              <FormInput defaultValue="" placeholder="メールアドレスを入力してください" type="email" />
            </div>

            <div className="mb-6">
              <Label>パスワード：</Label>
              <FormInput defaultValue="" placeholder="パスワードを入力してください" type="password" />
            </div>

            <div className="flex justify-center gap-4 mt-6 mb-8">
              <LinkButtons href="/Player/Home" className="w-full text-2xl mt-3">
                ログイン
              </LinkButtons>
            </div>

            <div className="flex justify-between pt-2">
              <LinkButton href="/ChangePassword">パスワードお忘れの方</LinkButton>
              <LinkButton href="/CreateAccount">新規登録</LinkButton>
            </div>
          </form>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

export default Login
