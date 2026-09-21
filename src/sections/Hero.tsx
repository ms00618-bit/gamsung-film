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

  const stillRefs = useRef<(HTMLImageElement | null)[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [loadPct, setLoadPct] = useState(0)
  /**
   * loading  = PC: 영상을 받는 중
   * video    = PC: 스크롤로 영상을 감는다
   * sequence = 휴대폰·태블릿: 영상을 나눈 사진 120장을 스크롤로 넘긴다
   * stills   = PC 인데 영상 재생이 막힌 경우 — 사진 3장을 스크롤로 넘긴다
   */
  const [mode, setMode] = useState<'loading' | 'video' | 'sequence' | 'stills'>(
    'loading',
  )
  const modeRef = useRef(mode)
  modeRef.current = mode

  // rAF 루프에서만 쓰는 값들 — 리렌더를 일으키지 않는다
  const target = useRef(0)
  const current = useRef(0)
  const seeking = useRef(false)
  const seekStarted = useRef(0)
  const duration = useRef(0)
  // 사진 넘기기용
  const frames = useRef<(HTMLImageElement | null)[]>([])
  const drawnIndex = useRef(-1)
  const needsDraw = useRef(false)

  // 영상을 통째로 받아서 메모리에 올린 뒤 재생기에 넣는다.
  // - 휴대폰 브라우저는 영상을 조금씩만 받아서, 스크롤로 감으면 끊기거나 멈춘다.
  // - 통째로 받으면 받은 양으로 로딩 진행률도 정확히 보여줄 수 있다.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    let cancelled = false
    let objectUrl = ''

    const onMeta = () => {
      duration.current = v.duration || 0
    }
    const onSeeked = () => {
      seeking.current = false
    }
    v.addEventListener('loadedmetadata', onMeta)
    v.addEventListener('seeked', onSeeked)

    // 휴대폰(특히 아이폰)은 한 번도 재생되지 않은 영상은 포스터만 계속 보여준다.
    // 소리 없는 영상은 자동 재생이 허용되므로 아주 잠깐 재생했다 멈춰서 '깨운다'.
    const cleanups: (() => void)[] = []
    const once = (target: EventTarget, type: string, fn: () => void) => {
      const handler = () => {
        target.removeEventListener(type, handler)
        fn()
      }
      target.addEventListener(type, handler)
      cleanups.push(() => target.removeEventListener(type, handler))
    }

    const wake = async (attempt = 0): Promise<void> => {
      if (cancelled) return
      // React 는 muted 를 HTML 속성으로 쓰지 않아서, 아이폰이 '소리 있는 영상'으로
      // 보고 재생을 막는 경우가 있다. 속성까지 직접 넣어준다.
      v.muted = true
      v.defaultMuted = true
      v.setAttribute('muted', '')
      v.setAttribute('playsinline', '')
      try {
        await v.play()
        v.pause()
        if (!cancelled) setMode('video')
        return
      } catch (err) {
        if (cancelled) return
        // 백그라운드 탭에서 열었을 때 — 화면에 보이는 순간 다시 시도
        if (document.hidden) {
          once(document, 'visibilitychange', () => wake(attempt))
          return
        }
        // 일시적으로 끊긴 경우 — 한 번만 다시 시도
        if ((err as DOMException)?.name === 'AbortError' && attempt === 0) {
          setTimeout(() => wake(1), 300)
          return
        }
        // 재생이 막힌 기기(아이폰 저전력 모드 등) — 사진으로 보여주다가
        // 첫 터치 때 다시 깨운다 (터치가 있으면 재생이 허용된다)
        console.warn('[hero] 영상을 깨우지 못해 사진 모드로 전환합니다:', err)
        setMode('stills')
        // 재생 허락으로 인정되는 건 '누르고 뗐을 때'다 (누르는 순간은 인정되지 않는다)
        once(window, 'click', () => wake(attempt + 1))
        once(window, 'touchend', () => wake(attempt + 1))
      }
    }

    // 휴대폰·태블릿 — 사진 120장을 받아 둔다.
    // 듬성듬성한 순서(16장 간격 → 8 → 4 → 2 → 1)로 받아서, 다 받기 전에도 스크롤이 움직인다.
    const loadSequence = () => {
      const { dir, count } = heroFilm.sequence
      const list: (HTMLImageElement | null)[] = new Array(count).fill(null)
      frames.current = list
      const order: number[] = []
      const seen = new Set<number>()
      for (const step of [16, 8, 4, 2, 1]) {
        for (let i = 0; i < count; i += step) {
          if (!seen.has(i)) {
            seen.add(i)
            order.push(i)
          }
        }
        if (!seen.has(count - 1)) {
          seen.add(count - 1)
          order.push(count - 1)
        }
      }

      let cursor = 0
      let done = 0
      const next = () => {
        if (cancelled || cursor >= order.length) return
        const i = order[cursor++]
        const img = new Image()
        img.decoding = 'async'
        const finish = () => {
          if (cancelled) return
          if (img.naturalWidth) list[i] = img
          done++
          needsDraw.current = true
          setLoadPct(Math.round((done / count) * 100))
          next()
        }
        img.onload = finish
        img.onerror = finish
        img.src = `${dir}f${String(i + 1).padStart(3, '0')}.webp`
      }
      setMode('sequence')
      for (let k = 0; k < 6; k++) next()
    }

    const load = async () => {
      try {
        const res = await fetch(heroFilm.src)
        if (!res.ok || !res.body) throw new Error(String(res.status))
        const total = Number(res.headers.get('content-length')) || 0
        const reader = res.body.getReader()
        const chunks: Uint8Array[] = []
        let received = 0
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          chunks.push(value)
          received += value.length
          if (total && !cancelled) {
            setLoadPct(Math.min(99, Math.round((received / total) * 100)))
          }
        }
        if (cancelled) return
        objectUrl = URL.createObjectURL(
          new Blob(chunks as BlobPart[], { type: 'video/mp4' }),
        )
        v.src = objectUrl
      } catch {
        // 받아오기에 실패하면 주소를 직접 연결한다
        if (cancelled) return
        v.src = heroFilm.src
      }
      setLoadPct(100)
      await wake()
    }

    // 주소 끝에 ?hero=sequence / ?hero=video 를 붙이면 방식을 강제로 고를 수 있다 (점검용)
    const forced = new URLSearchParams(window.location.search).get('hero')
    const touch = window.matchMedia('(pointer: coarse)').matches
    if (forced === 'sequence' || (forced !== 'video' && touch)) {
      loadSequence()
    } else {
      load()
    }

    const onResize = () => {
      needsDraw.current = true
    }
    window.addEventListener('resize', onResize)
    cleanups.push(() => window.removeEventListener('resize', onResize))

    return () => {
      cancelled = true
      cleanups.forEach((fn) => fn())
      v.removeEventListener('loadedmetadata', onMeta)
      v.removeEventListener('seeked', onSeeked)
      if (objectUrl) URL.revokeObjectURL(objectUrl)
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

        // 사진 120장 모드 — 스크롤 위치에 맞는 사진을 캔버스에 그린다
        if (modeRef.current === 'sequence') {
          const list = frames.current
          const want = Math.round(p * (list.length - 1))
          // 아직 안 받은 사진이면 가장 가까운 받은 사진을 쓴다
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
          const canvas = canvasRef.current
          if (canvas && pick >= 0 && (pick !== drawnIndex.current || needsDraw.current)) {
            const img = list[pick]!
            const dpr = Math.min(window.devicePixelRatio || 1, 2)
            const cw = Math.round(canvas.clientWidth * dpr)
            const ch = Math.round(canvas.clientHeight * dpr)
            if (canvas.width !== cw || canvas.height !== ch) {
              canvas.width = cw
              canvas.height = ch
            }
            const ctx = canvas.getContext('2d')
            if (ctx) {
              // object-fit: cover 와 같은 방식으로 꽉 채운다
              const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
              const dw = img.naturalWidth * scale
              const dh = img.naturalHeight * scale
              ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh)
            }
            drawnIndex.current = pick
            needsDraw.current = false
          }
        }

        // 사진 3장 모드 — 스크롤 위치에 따라 사진을 교차시킨다
        if (modeRef.current === 'stills') {
          const first = 1 - ramp(p, 0.3, 0.45)
          const last = ramp(p, 0.65, 0.8)
          const middle = clamp(1 - first - last)
          ;[first, middle, last].forEach((o, i) => {
            const img = stillRefs.current[i]
            if (img) img.style.opacity = String(o)
          })
        }

        // 영상 위치 동기화 — 영상이 준비되고 메타데이터가 로드된 뒤에만
        if (
          v &&
          modeRef.current === 'video' &&
          duration.current > 0 &&
          v.readyState >= 1
        ) {
          const t = p * (duration.current - 0.06)
          // 'seeked' 알림이 오지 않아 멈춰 버리는 것을 막는다
          if (seeking.current && performance.now() - seekStarted.current > 400) {
            seeking.current = false
          }
          if (!seeking.current && Math.abs(v.currentTime - t) > 0.012) {
            seeking.current = true
            seekStarted.current = performance.now()
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
        {/* src 는 영상을 다 받은 뒤 코드에서 넣는다 */}
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover ${
            mode === 'stills' || mode === 'sequence' ? 'invisible' : ''
          }`}
          poster={heroFilm.poster}
          preload="auto"
          muted
          playsInline
          // @ts-expect-error — 사파리 전용 속성
          disablePictureInPicture=""
        />
        {mode === 'sequence' && (
          <>
            {/* 첫 사진이 그려지기 전까지 보이는 포스터 */}
            <img
              src={heroFilm.poster}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              className="absolute inset-0 h-full w-full"
            />
          </>
        )}
        {mode === 'stills' &&
          heroFilm.stills.map((still, i) => (
            <img
              key={still.src}
              ref={(el) => {
                stillRefs.current[i] = el
              }}
              src={still.src}
              alt={still.caption}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ opacity: i === 0 ? 1 : 0 }}
            />
          ))}
        <div className="absolute inset-0 bg-ink/35" />
        <div
          ref={scrimRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-linear-to-t from-ink via-ink/75 to-transparent opacity-0"
        />

        {/* 로딩 표시 — 사진 모드는 앞부분 사진이 오면 바로 스크롤할 수 있어서 짧게만 보인다 */}
        {(mode === 'loading' || (mode === 'sequence' && loadPct < 8)) && (
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

        {mode === 'loading' && (
          <span className="sr-only">히어로 영상을 불러오는 중입니다.</span>
        )}

        {/* 점검용 — 주소 끝에 ?debug 를 붙이면 보인다 */}
        {typeof window !== 'undefined' &&
          new URLSearchParams(window.location.search).has('debug') && (
            <p className="absolute left-3 top-16 z-30 bg-black/80 px-2 py-1 font-mono text-[10px] leading-relaxed text-ivory">
              mode: {mode} · load: {loadPct}%
              <br />
              touch: {String(window.matchMedia('(pointer: coarse)').matches)} ·
              reduced: {String(window.matchMedia('(prefers-reduced-motion: reduce)').matches)}
            </p>
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
      {new URLSearchParams(window.location.search).has('debug') && (
        <p className="absolute left-3 top-16 z-30 bg-black/80 px-2 py-1 font-mono text-[10px] text-ivory">
          mode: reduced-motion (기기의 &apos;동작 줄이기&apos; 설정이 켜져 있음)
        </p>
      )}

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
