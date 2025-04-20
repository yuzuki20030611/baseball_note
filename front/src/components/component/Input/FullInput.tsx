'use client'

import React, { ChangeEvent, ReactNode } from 'react'

import { Input, Textarea } from '@chakra-ui/react'

type InputFieldProps = {
  type?: 'text' | 'number' | 'textarea' | 'password' | 'date' | 'email'
  placeholder?: string
  value?: string | number | Date | undefined
  name?: string
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  children?: ReactNode
  rows?: number
  height?: string | number
  className?: string
  maxWidth?: string | number
  min?: number
  step?: number | string
}

export const FullInput = ({
  type = 'text',
  placeholder,
  value,
  name,
  min,
  step,
  onChange,
  children,
  rows = 3,
  height,
  maxWidth = 'full',
  className = '',
  ...props
}: InputFieldProps) => {
  // 値を文字列または数値に変換
  const formattedValue = React.useMemo(() => {
    if (value === undefined || value === null) return ''
    if (value instanceof Date) {
      return type === 'date' ? value.toISOString().split('T')[0] : value.toString()
    }
    return value
  }, [value, type])

  if (type === 'textarea') {
    return (
      <Textarea
        placeholder={placeholder}
        name={name}
        value={formattedValue}
        padding="3px 10px"
        onChange={onChange}
        rows={rows}
        border="2px solid"
        borderColor="black"
        backgroundColor="white"
        maxWidth={maxWidth}
        transition="0.3s"
        height={height}
        className={className}
        {...props}
      >
        {children}
      </Textarea>
    )
  }

  return (
    <Input
      type={type}
      placeholder={placeholder}
      backgroundColor="white"
      name={name}
      value={formattedValue}
      min={min}
      step={step}
      padding="3px 10px"
      onChange={onChange}
      border="2px solid"
      autoComplete="new-password"
      borderColor="black"
      maxWidth={maxWidth}
      className={className}
      transition="0.3s"
      {...props}
    >
      {children}
    </Input>
  )
}
