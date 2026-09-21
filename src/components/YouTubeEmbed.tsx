import { useEffect, useId, useRef, useState } from 'react'
import { activateEmbed, onEmbedActivate } from '../lib/playback'

/**
 * 유튜브 영상.
 * 처음에는 포스터와 재생 버튼만 보이고, 누른 순간에 유튜브 재생기를 불러온다.
 * 누르기 전에는 유튜브에 아무 요청도 보내지 않는다.
 */
export function YouTubeEmbed({
  id,
  title,
  poster,
  label = 'PLAY',
}: {
  id: string
  title: string
  poster: string
  label?: string
}) {
  const key = useId()
  const boxRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  // 다른 유튜브 재생기가 열리면 이쪽은 닫는다
  useEffect(
    () => onEmbedActivate((k) => k !== key && setActive(false)),
    [key],
  )

  // 화면 밖으로 완전히 나가면 닫아서 재생을 멈춘다 (전체 화면일 때는 제외)
  useEffect(() => {
    const el = boxRef.current
    if (!el || !active) return
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting && !document.fullscreenElement) setActive(false)
    })
    io.observe(el)
    return () => io.disconnect()
  }, [active])

  const start = () => {
    activateEmbed(key)
    setActive(true)
  }

  return (
    <div
      ref={boxRef}
      className="relative aspect-video w-full overflow-hidden bg-black"
    >
      {active ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={start}
          aria-label={`${title} 재생`}
          className="group absolute inset-0 block"
        >
          <img
            src={poster}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink/45 transition-colors group-hover:bg-ink/25">
            <span className="flex h-16 w-16 items-center justify-center border border-ivory/70 transition-colors group-hover:border-amber md:h-24 md:w-24">
              <svg
                viewBox="0 0 24 24"
                className="ml-1 h-6 w-6 fill-ivory transition-colors group-hover:fill-amber md:h-7 md:w-7"
                aria-hidden="true"
              >
                <path d="M6 3.5 20 12 6 20.5z" />
              </svg>
            </span>
            <span className="font-mono text-[11px] tracking-[0.3em] text-ivory">
              {label}
            </span>
          </span>
        </button>
      )}
    </div>
  )
}

export const youtubeWatchUrl = (id: string) => `https://youtu.be/${id}`
