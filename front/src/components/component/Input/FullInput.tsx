'use client'

import React, { ChangeEvent, ReactNode } from 'react'

import { Input, Textarea } from '@chakra-ui/react'

type InputFieldProps = {
  type?: 'text' | 'number' | 'textarea' | 'password' | 'date' | 'email'
  placeholder?: string
  value?: string | number
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  children?: ReactNode
  rows?: number
  height?: string | number
  className?: string
}

export const FullInput = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  children,
  rows = 3,
  height,
  className = '',
  ...props
}: InputFieldProps) => {
  if (type === 'textarea') {
    return (
      <Textarea
        placeholder={placeholder}
        value={value}
        padding="3px 10px"
        onChange={onChange}
        rows={rows}
        border="2px solid"
        borderColor="black"
        backgroundColor="white"
        maxWidth="full"
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
      value={value}
      padding="3px 10px"
      onChange={onChange}
      border="2px solid"
      autoComplete="new-password"
      borderColor="black"
      maxWidth="full"
      className={className}
      transition="0.3s"
      {...props}
    >
      {children}
    </Input>
  )
}
