'use client'

import React, { ChangeEvent, ReactNode } from 'react'

import { Input, Textarea } from '@chakra-ui/react'

type InputFieldProps = {
  type?: 'text' | 'number' | 'textarea' | 'password' | 'email'
  placeholder?: string
  defaultValue?: string | number
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  children?: ReactNode
  rows?: number
  className?: string
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full' | string // 許可される値を明示的に定義
}

export const FormInput = ({
  type = 'text',
  placeholder,
  defaultValue,
  onChange,
  children,
  rows = 3,
  maxWidth = 'md',
  className = '',
  ...props
}: InputFieldProps) => {
  if (type === 'textarea') {
    return (
      <Textarea
        placeholder={placeholder}
        defaultValue={defaultValue}
        padding="3px 10px"
        onChange={onChange}
        rows={rows}
        backgroundColor="white"
        border="2px solid"
        borderColor="black"
        maxWidth={maxWidth}
        height="200px"
        transition="0.3s"
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
      defaultValue={defaultValue}
      padding="3px 10px"
      autoComplete="new-password"
      onChange={onChange}
      border="2px solid"
      borderColor="black"
      maxWidth={maxWidth}
      transition="0.3s"
      className={className}
      {...props}
    >
      {children}
    </Input>
  )
}
