import React from 'react'

export const MypracticeVideo = ({ src, title }: { src: string; title: string }) => {
  if (!src) return null

  let videoType = 'video/mp4'
  const fileExtension = src.split('.').pop()?.toLowerCase() || ''

  if (fileExtension === 'mov') {
    videoType = 'video/quicktime'
  } else if (fileExtension === 'avi') {
    videoType = 'video/x-msvideo'
  } else if (fileExtension === 'wmv') {
    videoType = 'video/x-ms-wmv'
  }

  // sourceが使用できない場合にしたの文字を使用
  return (
    <div className="my-4">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <video controls className="w-full max-w-2xl rounded-lg shadow-lg" style={{ maxHeight: '400px' }}>
        <source src={src} type={videoType} />
        お使いのブラウザは動画再生に対応していません
      </video>
    </div>
  )
}
