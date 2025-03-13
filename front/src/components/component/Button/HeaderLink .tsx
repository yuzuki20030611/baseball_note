import Link from 'next/link'
import React, { ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
  className?: string
  href?: string
}

export const HeaderLink = ({ children, href = '/', className = '' }: ButtonProps) => {
  return (
    <Link
      href={href}
      className={`
        inline-block
        px-6        /* 横方向のパディング */
        py-4        /* 縦方向のパディング */
        h-12        /* 高さ48px */
        w-120    /* 幅90px */
        rounded-md  /* ボーダーレディウス */
        text-xl   /* フォントサイズ */
        bg-white /* 背景色 */
        text-blue-700  /* 文字色 */
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
