import React, { ReactNode } from 'react'

type CardType = {
  children?: ReactNode
  className?: string
}

export const Card = ({ children, className = '' }: CardType) => {
  return (
    <div className={`bg-white border  bg-opacity-70 rounded-lg shadow-lg my-6 mx-6 p-8 ${className}`}>{children}</div>
  )
}
