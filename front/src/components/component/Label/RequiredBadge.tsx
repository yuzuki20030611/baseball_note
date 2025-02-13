import React from 'react'

type RequiredBadgeProps = {
  variant?: 'required' | 'optional'
  text?: string
  className?: string
} & React.HTMLAttributes<HTMLSpanElement>

export const RequiredBadge = ({
  variant = 'required',
  text = variant === 'required' ? '必須' : '任意',
  className = '',
}: RequiredBadgeProps) => {
  return (
    <span
      className={`
        ${variant === 'required' ? 'text-red-600' : 'text-gray-700'}
        border-2
        px-3 py-1.5
        mb-4
        rounded-full
        bg-white
        text-sm
        font-medium
        shadow-sm
        transition-all
        duration-200
        hover:shadow-md
        hover:brightness-110
        ${className} //スタイル適応
      `}
    >
      {text}
    </span>
  )
}
