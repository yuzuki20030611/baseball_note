import React from 'react'

interface VideoEmbedProps {
  url: string
  title?: string
}

export const SimpleVideoEmbed: React.FC<VideoEmbedProps> = ({ url, title = '参考動画' }) => {
  // YouTube動画IDを抽出する関数
  const getYouTubeVideoId = (url: string): string | null => {
    const match = url.match(/^.*(youtu.be\/|v\/|watch\?v=|&v=)([^#&?]*).*/)
    return match && match[2].length === 11 ? match[2] : null
  }

  const youTubeId = getYouTubeVideoId(url)
  const isFileVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(url)

  // コンテンツ部分を三項演算子で条件分岐
  // YouTubeIdがtrueだった場合、YouTubeIdを表示して、isFileVideoがtrueだった場合はisFileVideoを表示、
  // 動画でなかった場合は、リンクで表示する
  const content = youTubeId ? (
    <iframe
      className="w-full aspect-video rounded-lg shadow-lg"
      src={`https://www.youtube.com/embed/${youTubeId}`}
      title={title}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  ) : isFileVideo ? (
    <video className="w-full rounded-lg shadow-lg" controls>
      <source src={url} />
      お使いのブラウザは video タグに対応していません。
    </video>
  ) : (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
      {url}
    </a>
  )

  // 共通のラッパーでコンテンツを返す
  return (
    <div className="my-4">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      {content}
    </div>
  )
}
