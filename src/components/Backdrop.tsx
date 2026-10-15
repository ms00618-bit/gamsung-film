import { useEffect, useRef, useState } from 'react'
import { heroFilm } from '../content'
import { clamp } from '../lib/utils'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/**
 * 히어로 아래 구역들의 배경.
 * 히어로 영상이 페이지 뒤에 고정으로 깔리고, 스크롤에 따라 천천히 감긴다.
 * 그 위에 검은 막(veil)을 덮어 글씨가 읽히게 한다.
 *
 * - PC: 영상
 * - 휴대폰·태블릿: 히어로가 이미 받아 둔 사진을 몇 장 건너뛰며 재사용 (추가 다운로드 없음)
 * - 동작 줄이기 설정: 사진 한 장 고정
 */
export default function Backdrop() {
  const reduced = usePrefersReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const veilRef = useRef<HTMLDivElement>(null)

  const [mode, setMode] = useState<'off' | 'video' | 'sequence'>('off')
  const modeRef = useRef(mode)
  modeRef.current = mode

  const frames = useRef<(HTMLImageElement | null)[]>([])
  const drawn = useRef(-1)
  const seeking = useRef(false)
  const seekStarted = useRef(0)
  const duration = useRef(0)

  // 어떤 방식으로 보여줄지 정하고 준비한다
  useEffect(() => {
    if (reduced) return
    let cancelled = false
    const touch = window.matchMedia('(pointer: coarse)').matches

    if (touch) {
      // 히어로가 쓰는 사진 중 4장에 1장만 쓴다 (이미 받아 둔 것이라 다시 받지 않는다)
      const { dir, count } = heroFilm.sequence
      const picks: number[] = []
      for (let i = 0; i < count; i += 4) picks.push(i)
      const list: (HTMLImageElement | null)[] = new Array(picks.length).fill(null)
      frames.current = list
      picks.forEach((frameIndex, slot) => {
        const img = new Image()
        img.decoding = 'async'
        img.onload = () => {
          if (!cancelled) list[slot] = img
        }
        img.src = `${dir}f${String(frameIndex + 1).padStart(3, '0')}.webp`
      })
      setMode('sequence')
      return () => {
        cancelled = true
      }
    }

    const v = videoRef.current
    if (!v) return
    const onMeta = () => {
      duration.current = v.duration || 0
    }
    const onSeeked = () => {
      seeking.current = false
    }
    v.addEventListener('loadedmetadata', onMeta)
    v.addEventListener('seeked', onSeeked)
    v.muted = true
    v.setAttribute('muted', '')
    v.setAttribute('playsinline', '')
    v.src = heroFilm.src
    v.load()
    // 깨우기 — 실패해도 PC 는 탐색만으로 화면이 바뀐다
    v.play()
      .then(() => v.pause())
      .catch(() => {})

    let timer = 0
    const ready = () => {
      if (cancelled) return
      if (v.readyState >= 1) {
        window.clearInterval(timer)
        setMode('video')
      }
    }
    timer = window.setInterval(ready, 200)
    ready()

    return () => {
      cancelled = true
      window.clearInterval(timer)
      v.removeEventListener('loadedmetadata', onMeta)
      v.removeEventListener('seeked', onSeeked)
    }
  }, [reduced])

  // 스크롤에 맞춰 영상/사진 위치를 정한다
  useEffect(() => {
    if (reduced || mode === 'off') return
    let raf = 0

    const tick = () => {
      const wrap = wrapRef.current
      const veil = veilRef.current
      if (wrap) {
        // 페이지 맨 위부터 맨 아래까지를 0~1 로 본다
        const end = document.documentElement.scrollHeight - window.innerHeight
        const p = end > 0 ? clamp(window.scrollY / end) : 0

        // 표지(첫 화면)에서는 영상을 또렷하게 보여주고,
        // 한 화면 내려가는 동안 점점 어둡고 흐리게 만들어 글 읽기를 방해하지 않게 한다
        const dim = clamp(window.scrollY / window.innerHeight)
        wrap.style.filter = `blur(${(3 * dim).toFixed(2)}px)`
        if (veil) {
          veil.style.backgroundColor = `rgba(10, 10, 11, ${(0.4 + 0.52 * dim).toFixed(3)})`
        }

        if (modeRef.current === 'video') {
          const v = videoRef.current
          if (v && duration.current > 0 && v.readyState >= 1) {
            const t = p * (duration.current - 0.06)
            if (seeking.current && performance.now() - seekStarted.current > 400) {
              seeking.current = false
            }
            if (!seeking.current && Math.abs(v.currentTime - t) > 0.05) {
              seeking.current = true
              seekStarted.current = performance.now()
              try {
                v.currentTime = t
              } catch {
                seeking.current = false
              }
            }
          }
        } else {
          const list = frames.current
          const canvas = canvasRef.current
          const want = Math.round(p * (list.length - 1))
          let pick = -1
          for (let d = 0; d < list.length; d++) {
            if (list[want - d]) {
              pick = want - d
              break
            }
            if (list[want + d]) {
              pick = want + d
              break
            }
          }
          if (canvas && pick >= 0 && pick !== drawn.current) {
            const img = list[pick]!
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
            const cw = Math.round(canvas.clientWidth * dpr)
            const ch = Math.round(canvas.clientHeight * dpr)
            if (canvas.width !== cw || canvas.height !== ch) {
              canvas.width = cw
              canvas.height = ch
            }
            const ctx = canvas.getContext('2d')
            if (ctx) {
              const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
              const dw = img.naturalWidth * scale
              const dh = img.naturalHeight * scale
              ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh)
            }
            drawn.current = pick
          }
        }
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [mode, reduced])

  // 동작 줄이기 — 사진 한 장만 깔아 둔다
  if (reduced) {
    return (
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <img
          src={heroFilm.stills[1].src}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/90" />
      </div>
    )
  }

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <div ref={wrapRef} className="absolute inset-0">
        <video
          ref={videoRef}
          className={`h-full w-full object-cover ${
            mode === 'video' ? '' : 'hidden'
          }`}
          preload="auto"
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          className={`h-full w-full ${mode === 'sequence' ? '' : 'hidden'}`}
        />
      </div>
      {/* 글씨가 읽히도록 덮는 검은 막 — 스크롤에 따라 진해진다 */}
      <div ref={veilRef} className="absolute inset-0 bg-ink/40" />
    </div>
  )
}
