import { RadioGroup as ChakraRadioGroup } from '@chakra-ui/react'
import * as React from 'react'

export interface RadioProps extends React.ComponentProps<typeof ChakraRadioGroup.Item> {
  rootRef?: React.Ref<HTMLDivElement>
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(function Radio(props, ref) {
  const { children, inputProps, rootRef, ...rest } = props
  return (
    <ChakraRadioGroup.Item ref={rootRef} {...rest}>
      <ChakraRadioGroup.ItemHiddenInput ref={ref} {...inputProps} />
      <ChakraRadioGroup.ItemIndicator />
      {children && <ChakraRadioGroup.ItemText>{children}</ChakraRadioGroup.ItemText>}
    </ChakraRadioGroup.Item>
  )
})

export const RadioGroup = ChakraRadioGroup.Root
