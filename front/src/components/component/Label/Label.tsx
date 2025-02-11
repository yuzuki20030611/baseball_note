'use client'

import React, { ReactNode } from 'react'

import { Box, Text } from '@chakra-ui/react'

type LabelProps = {
  children: ReactNode
  className?: string
  fontSize?: string
}

export const Label = ({ children, className = '', fontSize = '16px' }: LabelProps) => {
  return (
    <Box display="inline-block">
      <Text as="label" fontSize={fontSize} fontWeight="bold" mb={1.5} display="inline-block" className={className}>
        {children}
      </Text>
    </Box>
  )
}
