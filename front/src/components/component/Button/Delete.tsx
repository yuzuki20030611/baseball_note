'use client'

import React, { ReactNode } from 'react'

import { Button as ChakraButton, type ButtonProps as ChakraButtonProps } from '@chakra-ui/react'

type DeleteButtonProps = ChakraButtonProps & {
  children: ReactNode
}

export const DeleteButton = ({
  children,
  borderColor,
  border = 'none',
  fontSize = 'md',
  ...props
}: DeleteButtonProps) => {
  return (
    <ChakraButton
      bg="white"
      color="blue.600"
      _hover={{ bg: 'gray.100' }}
      fontSize={fontSize}
      height="32px"
      width="80px"
      padding="0 5px"
      border={border}
      borderColor={borderColor}
      {...props}
    >
      {children}
    </ChakraButton>
  )
}
