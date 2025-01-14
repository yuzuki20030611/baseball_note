import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { getUser } from './libs/getUser'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile',
        },
      },
    }),
  ],
  // TODO 環境変数から取得する
  trustHost: true,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (
        account?.provider === 'google' &&
        profile?.email_verified === true &&
        profile?.email?.endsWith('@foresight-inc.co.jp')
      ) {
        if (!account.access_token) {
          throw new Error('access_token is required')
        }
        const data = await getUser(profile, account.access_token)
        if (data) {
          Object.assign(user, data)
          return Promise.resolve(true)
        }
        return Promise.resolve(false)
      } else {
        return Promise.resolve(false)
      }
    },
    async redirect({ url, baseUrl }) {
      // カスタムリダイレクトロジックを実装
      if (url.startsWith(baseUrl)) {
        return url
      } else if (url.startsWith('/')) {
        return new URL(url, baseUrl).toString()
      }
      return baseUrl
    },
    async jwt({ token, account, user }) {
      if (account) token.accessToken = account.access_token
      if (user) {
        const { id, uid, name, role, departments } = user
        Object.assign(token, { id, uid, name, role, departments })
      }
      return token
    },
    async session({ session, token }) {
      const { id, uid, name, role, departments, email, emailVerified } = token

      // JWTからセッションにアクセストークンを追加
      session.accessToken = token.accessToken as string
      session.user = {
        id: id as string,
        uid: uid as string,
        name: name as string,
        role: role as string,
        departments: departments as string[],
        email: email as string,
        emailVerified: emailVerified as Date | null,
      }
      return session
    },
  },
})
