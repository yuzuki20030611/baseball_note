import React from 'react'
import dynamic from 'next/dynamic'
import dynamicIconImports from 'lucide-react/dynamicIconImports'

export const getLucideIcon = (iconName: keyof typeof dynamicIconImports): React.ReactElement => {
  const LucideIcon = dynamic(dynamicIconImports[iconName])
  return <LucideIcon />
}
