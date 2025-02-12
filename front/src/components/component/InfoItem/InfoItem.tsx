import { ReactNode } from 'react'

type InfoItemProps = {
  label?: ReactNode
  value?: ReactNode
  className?: string
  type?: 'text' | 'password' | 'textarea' | 'number'
}

export const InfoItem = ({ label, value, className = '', type = 'text' }: InfoItemProps) => {
  if (type === 'textarea') {
    return (
      <div className={`w-full p-1 border-b border-black ${className}`}>
        <div className="font-semibold text-md text-black mb-2">{label}</div>
        {value}
      </div>
    )
  }

  return (
    <div className={`w-full p-1 border-b border-black ${className}`}>
      <div className="font-semibold text-md text-black mb-2">{label}</div>
      <span className="text-lg">{value}</span>
    </div>
  )
}
