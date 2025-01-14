import { createSystem, defaultConfig } from '@chakra-ui/react'


export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      breakpoints: {
        base: { value: '0px' },
        sm: { value: '480px' },
        md: { value: '768px' },
        lg: { value: '1025px' },
      },
    },
  },
})
