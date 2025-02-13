import React, { ReactNode } from 'react'
import { Button as ChakraButton } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

type NavigationButtonProps = {
  children: ReactNode
  href: string
  className?: string
  onClick?: () => void
}

export const NavigationButton = ({ children, href, className = '', onClick, ...props }: NavigationButtonProps) => {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
    router.push(href)
  }

  return (
    <ChakraButton
      px="6"
      py="4"
      h="48px"
      w="90px"
      borderRadius="md"
      fontSize="md"
      border="none"
      bg="blue.500"
      color="white"
      cursor="pointer"
      className={className}
      onClick={handleClick}
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

export default NavigationButton
