import React, { ReactNode } from 'react'
import Link from 'next/link'

type LinkButtonProps = {
  children: ReactNode
  className?: string
  href?: string
}

export const LinkButton = ({
  children,
  className = 'text-blue-600 hover:text-blue-800 text-sm font-medium',
  href = '/',
}: LinkButtonProps) => {
  return (
    <Link href={href} className={`text-blue-600 hover:text-blue-800 text-sm font-medium'${className}`}>
      {children}
    </Link>
  )
}
