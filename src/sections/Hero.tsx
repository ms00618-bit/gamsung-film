import { useEffect, useRef, useState } from 'react'
import { brand, heroFilm } from '../content'
import { band, clamp, ramp } from '../lib/utils'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/**
 * 히어로.
 * 스크롤 진행률(0~1)을 영상의 currentTime에 연결한다.
 * 영상은 절대 스스로 재생되지 않는다. 스크롤만이 재생 위치를 정한다.
 */
export default function Hero() {
  const reduced = usePrefersReducedMotion()
  if (reduced) return <HeroReduced />
  return <HeroScrub />
}

function HeroScrub() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const cap1Ref = useRef<HTMLParagraphElement>(null)
  const cap2Ref = useRef<HTMLParagraphElement>(null)
  const finalRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const scrimRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)

  const [loadPct, setLoadPct] = useState(0)
  const [ready, setReady] = useState(false)

  // rAF 루프에서만 쓰는 값들 — 리렌더를 일으키지 않는다
  const target = useRef(0)
  const current = useRef(0)
  const seeking = useRef(false)
  const duration = useRef(0)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const onMeta = () => {
      duration.current = v.duration || 0
      setReady(true)
    }
    const onSeeked = () => {
      seeking.current = false
    }
    const onProgress = () => {
      if (!v.duration || v.buffered.length === 0) return
      const end = v.buffered.end(v.buffered.length - 1)
      setLoadPct(Math.round((end / v.duration) * 100))
    }

    v.addEventListener('loadedmetadata', onMeta)
    v.addEventListener('seeked', onSeeked)
    v.addEventListener('progress', onProgress)
    v.addEventListener('canplaythrough', () => setLoadPct(100))
    if (v.readyState >= 1) onMeta()

    return () => {
      v.removeEventListener('loadedmetadata', onMeta)
      v.removeEventListener('seeked', onSeeked)
      v.removeEventListener('progress', onProgress)
    }
  }, [])

  useEffect(() => {
    let raf = 0

    const setOpacity = (
      el: HTMLElement | null,
      value: number,
      lift = 0,
    ) => {
      if (!el) return
      el.style.opacity = String(value)
      el.style.transform = `translate3d(0, ${(1 - value) * lift}px, 0)`
      el.style.pointerEvents = value > 0.5 ? 'auto' : 'none'
    }

    const tick = () => {
      const wrap = wrapRef.current
      const v = videoRef.current
      if (wrap) {
        const rect = wrap.getBoundingClientRect()
        const total = wrap.offsetHeight - window.innerHeight
        target.current = total > 0 ? clamp(-rect.top / total) : 0

        // 목표값을 향해 감속하며 따라간다 → 빠르게 스크롤해도 튀지 않는다
        const diff = target.current - current.current
        current.current += diff * 0.14
        if (Math.abs(diff) < 0.0004) current.current = target.current

        const p = current.current

        // 영상 위치 동기화 — 메타데이터가 로드된 뒤에만
        if (v && duration.current > 0 && v.readyState >= 1) {
          const t = p * (duration.current - 0.06)
          if (!seeking.current && Math.abs(v.currentTime - t) > 0.012) {
            seeking.current = true
            try {
              v.currentTime = t
            } catch {
              seeking.current = false
            }
          }
        }

        // 카피 단계별 노출
        setOpacity(cap1Ref.current, band(p, 0, 0.06, 0.26, 0.33), 14)
        setOpacity(cap2Ref.current, band(p, 0.35, 0.42, 0.62, 0.7), 14)
        setOpacity(finalRef.current, ramp(p, 0.75, 0.88), 24)
        setOpacity(ctaRef.current, ramp(p, 0.9, 0.98), 16)
        // 마지막 장면은 밝은 스크린이라, 카피가 나올 때 아래쪽을 어둡게 깐다
        if (scrimRef.current) {
          scrimRef.current.style.opacity = String(ramp(p, 0.68, 0.86))
        }
        setOpacity(hintRef.current, 1 - ramp(p, 0, 0.06))
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${p})`
        }
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <section
      id="hero"
      ref={wrapRef}
      className="relative h-[300vh] md:h-[450vh]"
      aria-label="히어로"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden vignette">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={heroFilm.src}
          poster={heroFilm.poster}
          preload="auto"
          muted
          playsInline
          // @ts-expect-error — 사파리 전용 속성
          disablePictureInPicture=""
        />
        <div className="absolute inset-0 bg-ink/35" />
        <div
          ref={scrimRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-linear-to-t from-ink via-ink/75 to-transparent opacity-0"
        />

        {/* 로딩 표시 */}
        {loadPct < 100 && (
          <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="font-mono text-[11px] tracking-[0.3em] text-ash">
              LOADING {String(loadPct).padStart(2, '0')}%
            </p>
            <div className="mx-auto mt-3 h-px w-32 bg-hair">
              <div
                className="h-px bg-amber transition-[width] duration-200"
                style={{ width: `${loadPct}%` }}
              />
            </div>
          </div>
        )}

        {/* 0~30% */}
        <p
          ref={cap1Ref}
          className="absolute bottom-24 left-6 max-w-[80vw] font-body text-base text-ivory/90 opacity-0 md:bottom-28 md:left-16 md:text-lg"
        >
          {brand.heroCaptions.first}
        </p>

        {/* 35~65% */}
        <p
          ref={cap2Ref}
          className="absolute bottom-24 left-6 max-w-[80vw] font-body text-base text-ivory/90 opacity-0 md:bottom-28 md:left-16 md:text-lg"
        >
          {brand.heroCaptions.second}
        </p>

        {/* 75~100% — 화면 아래쪽에 배치해 영상의 피사체를 가리지 않는다 */}
        <div
          ref={finalRef}
          className="absolute inset-x-0 bottom-0 z-10 px-6 pb-24 opacity-0 md:px-16 md:pb-20"
        >
          <p className="font-mono text-[11px] tracking-[0.35em] text-ash">
            {brand.name.toUpperCase()} · {brand.team}
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-[2rem] leading-[1.08] font-bold tracking-tight text-ivory sm:text-5xl md:text-6xl lg:text-7xl">
            {brand.headline}
          </h1>
          <p className="mt-4 max-w-xl text-sm text-ash md:text-base">
            {brand.sub}
          </p>
          <p className="mt-2 font-mono text-[11px] tracking-[0.25em] text-steel">
            {brand.roleline}
          </p>

          <div
            ref={ctaRef}
            className="mt-7 flex flex-col gap-3 opacity-0 sm:flex-row"
          >
            <a
              href="#reel"
              className="group inline-flex items-center justify-center border border-ivory/70 px-7 py-3.5 font-mono text-xs tracking-[0.2em] text-ivory transition-colors duration-200 hover:bg-ivory hover:text-ink"
            >
              릴 보기
            </a>
            <a
              href="#works"
              className="group inline-flex items-center justify-center border border-hair px-7 py-3.5 font-mono text-xs tracking-[0.2em] text-ash transition-colors duration-200 hover:border-amber hover:text-amber"
            >
              작품 보기
            </a>
          </div>
        </div>

        {/* 스크롤 안내 */}
        <div
          ref={hintRef}
          className="absolute bottom-7 left-1/2 -translate-x-1/2 text-center"
        >
          <p className="font-mono text-[10px] tracking-[0.3em] text-ash">
            SCROLL
          </p>
          <div className="mx-auto mt-2 h-8 w-px bg-linear-to-b from-ash to-transparent" />
        </div>

        {/* 진행 막대 */}
        <div className="absolute bottom-0 left-0 z-20 h-px w-full bg-hair">
          <span
            ref={barRef}
            className="block h-px w-full origin-left scale-x-0 bg-amber"
          />
        </div>

        {/* 아직 HERO FILM이 생성되지 않았음을 명시한다 */}
        {heroFilm.isPlaceholder && (
          <p className="absolute right-4 top-20 z-20 max-w-[42vw] text-right font-mono text-[9px] leading-relaxed tracking-wider text-steel md:right-6 md:max-w-none md:text-[10px]">
            PLACEHOLDER — HERO FILM 미생성
            <br />
            {heroFilm.src}
          </p>
        )}

        {!ready && (
          <span className="sr-only">히어로 영상을 불러오는 중입니다.</span>
        )}
      </div>
    </section>
  )
}

/** prefers-reduced-motion 대체 화면 — 스크러빙 없이 3장이 천천히 교차된다 */
function HeroReduced() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % heroFilm.stills.length),
      4200,
    )
    return () => clearInterval(id)
  }, [])

  return (
    <section
      id="hero"
      className="relative h-screen w-full overflow-hidden vignette"
      aria-label="히어로"
    >
      {heroFilm.stills.map((still, i) => (
        <img
          key={still.src}
          src={still.src}
          alt={still.caption}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}
      <div className="absolute inset-0 bg-ink/45" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-linear-to-t from-ink via-ink/75 to-transparent"
      />

      <div className="absolute inset-x-0 bottom-0 px-6 pb-16 md:px-16">
        <p className="font-mono text-[11px] tracking-[0.35em] text-ash">
          {brand.name.toUpperCase()} · {brand.team}
        </p>
        <h1 className="mt-4 max-w-4xl font-display text-[2rem] leading-[1.08] font-bold tracking-tight text-ivory sm:text-5xl md:text-6xl">
          {brand.headline}
        </h1>
        <p className="mt-4 max-w-xl text-sm text-ash md:text-base">
          {brand.sub}
        </p>
        <p className="mt-2 font-mono text-[11px] tracking-[0.25em] text-steel">
          {heroFilm.stills[index].caption}
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <a
            href="#reel"
            className="inline-flex items-center justify-center border border-ivory/70 px-7 py-3.5 font-mono text-xs tracking-[0.2em] text-ivory transition-colors hover:bg-ivory hover:text-ink"
          >
            릴 보기
          </a>
          <a
            href="#works"
            className="inline-flex items-center justify-center border border-hair px-7 py-3.5 font-mono text-xs tracking-[0.2em] text-ash transition-colors hover:border-amber hover:text-amber"
          >
            작품 보기
          </a>
        </div>
      </div>
    </section>
  )
}
