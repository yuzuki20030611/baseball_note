import React from 'react'

import { HeaderLink } from '../Button/HeaderLink'

type HeaderProps = {
  children?: string
  href?: string
  role?: 'coach' | 'player'
}

export const Header = ({ children, href, role }: HeaderProps) => {
  return (
    <header className="bg-gradient-to-r from-[#2563eb] to-[#1e40af] shadow-lg">
      <div className="max-w-[80rem] mx-auto p-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 pt-7 ">
            <h1 className="text-2xl font-bold text-white">野球ノート⚾️</h1>
          </div>
          <div className="flex flex-end">
            <HeaderLink href={href} role={role}>
              {children}
            </HeaderLink>
          </div>
        </div>
      </div>
    </header>
  )
}
