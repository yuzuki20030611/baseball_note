import React from 'react'

export const VideoPlayer = ({ src, title }: { src: string; title: string }) => {
  if (!src) return null

  // sourceが使用できない場合にしたの文字を使用
  return (
    <div className="my-4">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <video controls className="w-full max-w-2xl rounded-lg shadow-lg" style={{ maxHeight: '400px' }}>
        <source src={src} type="video/mp4" />
        お使いのブラウザは動画再生に対応していません
      </video>
    </div>
  )
}
