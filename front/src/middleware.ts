import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'


export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || '',
    secureCookie: process.env.NODE_ENV === 'production',
  })
  const { pathname } = req.nextUrl

  // ログインページにアクセスしようとしている場合
  if (pathname.startsWith('/login')) {
    if (token) {
      // 既にログインしている場合、ホームページにリダイレクト
      return NextResponse.redirect(new URL('/', req.url))
    }
    // ログインしていない場合はそのまま
    return NextResponse.next()
  }

  // トークンが無効な場合の処理
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
