import { useEffect, useRef } from 'react'
import { pipeline } from '../content'
import { SectionHead } from '../components/SectionHead'
import { useInView } from '../hooks/useInView'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { claim, release } from '../lib/playback'

type Step = (typeof pipeline)[number]

/** 영상이 아직 없는 칸에 보여줄 경로 */
const EXPECTED = [
  '/videos/pipeline-01-shoot.mp4',
  '/videos/pipeline-02-generate.mp4',
  '/videos/pipeline-03-combine.mp4',
]

export default function Pipeline() {
  const videos = useRef<(HTMLVideoElement | null)[]>([])
  const reduced = usePrefersReducedMotion()

  // 화면에 절반 이상 보이는 칸 중 화면 가운데에 가장 가까운 하나만 재생한다
  useEffect(() => {
    if (reduced) return
    const els = videos.current.filter((v): v is HTMLVideoElement => Boolean(v))
    if (els.length === 0) return
    const ratios = new Map<HTMLVideoElement, number>()

    const pick = () => {
      const mid = window.innerHeight / 2
      let best: HTMLVideoElement | null = null
      let bestDist = Infinity
      for (const v of els) {
        if ((ratios.get(v) ?? 0) < 0.5) continue
        const r = v.getBoundingClientRect()
        const dist = Math.abs(r.top + r.height / 2 - mid)
        if (dist < bestDist) {
          bestDist = dist
          best = v
        }
      }
      for (const v of els) {
        if (v === best) {
          if (v.paused) {
            claim(v)
            v.play().catch(() => {})
          }
        } else if (!v.paused) {
          v.pause()
          release(v)
        }
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          ratios.set(e.target as HTMLVideoElement, e.intersectionRatio)
        }
        pick()
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    )
    els.forEach((v) => io.observe(v))

    // 두 칸이 모두 다 보이는 큰 화면에서는 비율이 안 바뀌므로 스크롤로도 다시 고른다
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        pick()
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      els.forEach((v) => {
        v.pause()
        release(v)
      })
    }
  }, [reduced])

  return (
    <section
      id="pipeline"
      className="relative border-t border-hair bg-ink px-5 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[1600px]">
        <SectionHead
          index="04 — PIPELINE"
          title={'CAMERA,\nMODEL,\nTIMELINE'}
          lead="도구는 두 종류다. 결과물은 한 편이다."
        />

        <div className="space-y-px">
          {pipeline.map((step, i) => (
            <StepRow
              key={step.no}
              step={step}
              expected={EXPECTED[i]}
              flip={i % 2 === 1}
              videoRef={(el) => {
                videos.current[i] = el
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function StepRow({
  step,
  expected,
  flip,
  videoRef,
}: {
  step: Step
  expected: string
  flip: boolean
  videoRef: (el: HTMLVideoElement | null) => void
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.25)

  return (
    <div
      ref={ref}
      className={`grid items-start gap-8 border-t border-hair py-12 transition-opacity duration-700 md:gap-16 md:py-16 ${
        flip ? 'md:grid-cols-[1fr_38%]' : 'md:grid-cols-[38%_1fr]'
      } ${inView ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className={flip ? 'md:order-2' : ''}>
        <div className="relative aspect-4/3 w-full overflow-hidden border border-hair bg-ink-2">
          {step.video ? (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              src={step.video}
              poster={step.poster || undefined}
              muted
              loop
              playsInline
              preload="none"
              aria-label={`${step.title} 과정 영상`}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
              <p className="font-mono text-[11px] tracking-[0.3em] text-ash">
                {step.no} — {step.title}
              </p>
              <p className="font-mono text-[9px] leading-relaxed tracking-wider text-steel">
                영상 준비 중
                <br />
                1440×1080 (4:3) · 24fps · 무음 · 약 6초
                <br />
                {expected}
              </p>
            </div>
          )}
          {/* 모서리 표시 */}
          <span className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l border-t border-amber/60" />
          <span className="pointer-events-none absolute right-0 bottom-0 h-3 w-3 border-r border-b border-silver/60" />
        </div>
      </div>

      <div className={flip ? 'md:order-1' : ''}>
        <p className="font-mono text-[11px] tracking-[0.3em] text-amber">
          {step.no}
        </p>
        <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-ivory md:text-3xl">
          {step.title}
        </h3>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-ash md:text-base">
          {step.body}
        </p>
        <p className="mt-6 font-mono text-[10px] leading-relaxed tracking-[0.15em] text-steel">
          {step.tools}
        </p>
      </div>
    </div>
  )
}
