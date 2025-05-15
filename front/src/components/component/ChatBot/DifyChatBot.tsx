'use client'

import { useState } from 'react'
import Image from 'next/image'

interface DifyChatBotProps {
  firebase_uid: string | undefined
  position?: 'right' | 'left'
  top?: string
}

const DifyChatBot: React.FC<DifyChatBotProps> = ({ firebase_uid, position = 'right', top = '28' }) => {
  const [showChatBot, setShowChatBot] = useState(false)

  const getChatbotUrl = () => {
    const baseUrl = 'https://udify.app/chatbot/gaTgw6ctyvoHW6FU'
    const queryParams = new URLSearchParams({
      user_id: firebase_uid || '',
      timestamp: Date.now().toString(),
    }).toString()

    return `${baseUrl}?${queryParams}`
  }

  return (
    <div className={`fixed ${position}-3 top-${top} z-50`}>
      {showChatBot ? (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col border-2 border-blue-600 w-150 h-[500px]">
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <span className="font-bold text-lg">野球ノートアシスタント</span>
            <button onClick={() => setShowChatBot(false)} className="text-white hover:text-gray-200">
              ✕
            </button>
          </div>
          <div className="flex-grow">
            <iframe
              src={getChatbotUrl()}
              style={{ width: '100%', height: '100%' }}
              frameBorder="0"
              allow="microphone"
              title="野球ノートアシスタント"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            ></iframe>
          </div>
        </div>
      ) : (
        <div className="relative group">
          <button
            onClick={() => setShowChatBot(true)}
            className="bg-gradient-to-br from-blue-500 to-orange-400 p-2 rounded-lg shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform border-2 border-white"
          >
            <div className="relative">
              <Image
                src="/images/6e7d2e894061ab23ae3f00d26c47a1d4_t.jpeg"
                alt="恐竜アシスタント"
                width="60"
                height="60"
                className="rounded-lg"
              />
              <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs px-1 rounded-full border border-white">
                質問
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

export default DifyChatBot
