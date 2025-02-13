import React, { ReactNode } from 'react'

import Link from 'next/link'

type ButtonProps = {
  children: ReactNode
  className?: string
  href: string
}

export const LinkButtons = ({ children, href, className = '' }: ButtonProps) => {
  return (
    <Link
      href={href}
      className={`
        inline-flex
        items-center
        justify-center
        px-6
        py-4
        h-12
        w-90px
        rounded-md
        text-md
        bg-blue-500
        text-white
        border-none
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
