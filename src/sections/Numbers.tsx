import { useEffect, useState } from 'react'
import { works } from '../content'
import { SectionHead } from '../components/SectionHead'
import { useInView } from '../hooks/useInView'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { monthsBetween } from '../lib/utils'

// 모든 수치는 작품 데이터에서 계산한다. 따로 적어 넣지 않는다.
const count = (t: string) => works.filter((w) => w.type === t).length
const live = count('live')
const hybrid = count('hybrid')
const ai = count('ai')
const cameraCount = new Set(works.flatMap((w) => w.camera)).size
const modelCount = new Set(works.flatMap((w) => w.model)).size
const longest = Math.max(
  ...works.map((w) => monthsBetween(w.periodStart, w.periodEnd)),
)

const STATS = [
  { value: works.length, unit: '편', label: '대표작' },
  { value: cameraCount, unit: '종', label: '촬영 장비' },
  { value: modelCount, unit: '종', label: 'AI 도구' },
  { value: longest, unit: '개월', label: '최장 제작 기간' },
]

export default function Numbers() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3)

  return (
    <section
      id="numbers"
      className="relative border-t border-hair bg-ink px-5 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[1600px]" ref={ref}>
        <SectionHead index="05 — NUMBERS" title="SHOT / GENERATED" />

        <div className="grid grid-cols-1 border-t border-hair md:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="border-b border-hair px-0 py-9 md:border-r md:px-8 md:py-12 md:first:pl-0"
            >
              <p className="font-display text-5xl font-bold tracking-tight text-ivory tabular-nums md:text-6xl lg:text-7xl">
                <CountUp to={s.value} run={inView} />
                <span className="ml-2 font-mono text-base font-normal tracking-normal text-steel md:text-lg">
                  {s.unit}
                </span>
              </p>
              <p className="mt-4 font-mono text-[10px] tracking-[0.25em] text-ash">
                {s.label.toUpperCase()}
              </p>
              <p className="mt-1 text-xs text-steel">{s.label}</p>
            </div>
          ))}
        </div>

        {/* 실사 : 하이브리드 : AI 비율 — 얇은 막대 하나 */}
        <div className="mt-16 md:mt-20">
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-[10px] tracking-[0.25em] text-ash">
              LIVE / HYBRID / AI
            </p>
            <p className="font-display text-2xl font-bold text-ivory tabular-nums md:text-3xl">
              {live} / {hybrid} / {ai}
            </p>
          </div>

          <div className="mt-5 flex h-0.5 w-full gap-px">
            <span
              className="block bg-amber transition-[width] duration-1000 ease-out"
              style={{ width: inView ? `${(live / works.length) * 100}%` : '0%' }}
            />
            <span
              className="block bg-linear-to-r from-amber to-silver transition-[width] duration-1000 ease-out"
              style={{ width: inView ? `${(hybrid / works.length) * 100}%` : '0%' }}
            />
            <span
              className="block bg-silver transition-[width] duration-1000 ease-out"
              style={{ width: inView ? `${(ai / works.length) * 100}%` : '0%' }}
            />
          </div>

          <div className="mt-3 flex justify-between font-mono text-[10px] tracking-[0.2em] text-steel">
            <span>실사 {live}</span>
            <span>하이브리드 {hybrid}</span>
            <span>AI {ai}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function CountUp({ to, run }: { to: number; run: boolean }) {
  const reduced = usePrefersReducedMotion()
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!run) return
    if (reduced) {
      setN(to)
      return
    }
    const duration = 1100
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      // 부드러운 감속
      const eased = 1 - Math.pow(1 - t, 3)
      setN(Math.round(eased * to))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [run, to, reduced])

  return <>{n}</>
}
