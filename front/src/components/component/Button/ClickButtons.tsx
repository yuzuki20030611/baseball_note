import React, { ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
  className?: string
  onClick: () => void
  width?: string
  disabled?: boolean
}

export const ClickButtons = ({ children, onClick, className = '', width = '90px', disabled = false }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex
        items-center
        justify-center
        px-6
        py-4
        h-12
        w-[${width}]
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
    </button>
  )
}
