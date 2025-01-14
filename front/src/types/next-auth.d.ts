import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    uid: string
    role: string
    departments: string[]
  }

  interface Session {
    accessToken: string
    user: {
      id: string
      uid: string
      role: string
      email: string
      name?: string | null
      departments: string[]
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
  }
}
