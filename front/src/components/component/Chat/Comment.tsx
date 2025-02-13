'use client'

import React from 'react'

import { Textarea } from '@chakra-ui/react'
import { Buttons } from '../Button/Button'

export const Comment = () => {
  return (
    <div className="mt-4">
      <div className="bg-white rounded-lg">
        <Textarea
          placeholder="コメント入力"
          className="rounded-t-lg w-full bg-white resize-none min-h-[100px]"
          rows={4}
        />
        <div className="flex justify-end p-2 border-t border-gray-200">
          <Buttons fontSize="18px" height="43px" width="75px">
            送信
          </Buttons>
        </div>
      </div>
    </div>
  )
}
