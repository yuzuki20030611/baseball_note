import React, { ReactNode } from 'react'

type InfoItemProps = {
  label?: string
  value?: ReactNode
  className?: string
}

export const InfoItem = ({ label, value, className }: InfoItemProps) => {
  return (
    <div className={`w-full p-1 border-b border-black ${className}`}>
      <div className="font-semibold text-md text-black mb-2 ">{label}</div>
      <span className="text-lg">{value}</span>
    </div>
  )
}
