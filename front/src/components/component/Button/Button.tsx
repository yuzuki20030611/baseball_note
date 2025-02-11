'use client'

import React, { ReactNode } from 'react'

import { Button as ChakraButton } from '@chakra-ui/react'
import type { ButtonProps as ChakraButtonProps } from '@chakra-ui/react'

// ChakraUIのButtonPropsを継承
type ButtonProps = ChakraButtonProps & {
  children: ReactNode
  className?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export const Buttons = ({ children, className = '', onClick, ...props }: ButtonProps) => {
  return (
    <ChakraButton
      px="6" // 横方向のパディングを増やす (24px相当)
      py="4" // 縦方向のパディングを増やす (16px相当)
      h="48px" // 高さを48pxに固定
      w="90px"
      borderRadius="md"
      fontSize="md"
      border="none"
      bg="blue.500"
      color="white"
      cursor="pointer"
      className={className}
      onClick={onClick}
      _hover={{
        bg: 'blue.600',
      }}
      _disabled={{
        opacity: 0.5,
        cursor: 'not-allowed',
      }}
      {...props}
    >
      {children}
    </ChakraButton>
  )
}
