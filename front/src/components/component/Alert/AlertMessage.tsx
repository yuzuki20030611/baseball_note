'use clinet'
import React from 'react'

type AlertMessageProps = {
  status: 'success' | 'error'
  message: string
  isVisible: boolean
}

const AlertMessage: React.FC<AlertMessageProps> = ({ status, message, isVisible }) => {
  if (!isVisible) return null

  const statusStyles = {
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-pink-100 border-red-500 text-red-700',
  }
  return (
    <div className="mb-4">
      <div className={`p-4 rounded-md-4 border-l-4" ${statusStyles[status]}`}>
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm font-medium">{message}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlertMessage
