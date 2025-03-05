import Link from 'next/link'
import React, { ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
  className?: string
  href?: string
  role?: 'player' | 'coach' // ロールを追加
}

export const HeaderLink = ({ children, href, role, className = '' }: ButtonProps) => {
  // テキストとロールに基づいてhrefを決定
  let linkHref = href
  if (!linkHref) {
    if (children === 'ログアウト') {
      linkHref = '/'
    } else if (children === 'ホーム画面') {
      // ロールに基づいてホーム画面のURLを決定
      if (role === 'coach') {
        linkHref = '/Coach/Home'
      } else {
        linkHref = '/Player/Home' // デフォルトはプレイヤー
      }
    } else {
      linkHref = '/' // デフォルト
    }
  }

  return (
    <Link
      href={linkHref}
      className={`
        inline-block
        px-6
        py-4
        h-12
        w-120
        rounded-md
        text-xl
        bg-white
        text-blue-700
        mt-2
        pt-3
        cursor-pointer
        hover:bg-blue-600
        disabled:opacity-50
        disabled:cursor-not-allowed
        transition-colors
        ${className}
      `}
    >
      {children}
    </Link>
  )
}
