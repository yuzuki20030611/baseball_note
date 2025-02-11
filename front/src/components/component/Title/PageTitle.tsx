import React, { ReactNode } from 'react'

type PageTitleProps = {
  children: ReactNode
  className?: string
}

export const PageTitle = ({ children, className = '' }: PageTitleProps) => {
  return <h1 className={`text-4xl font-bold text-center my-6 ${className}`}>{children}</h1>
}
