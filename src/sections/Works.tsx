import { useEffect, useRef, useState } from 'react'
import type { Work, WorkType } from '../content'
import { archive, works } from '../content'
import { SectionHead } from '../components/SectionHead'
import { WorkTag } from '../components/WorkTag'
import { claim, release } from '../lib/playback'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { YouTubeEmbed, youtubeWatchUrl } from '../components/YouTubeEmbed'
import { ArchiveList, sortArchive } from './WorksArchive'

/** top = 대표작 5편, all = 전체 작품, live/hybrid/ai = 전체 중 종류별 */
type Filter = 'top' | 'all' | WorkType

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'top', label: 'TOP' },
  { id: 'all', label: 'ALL' },
  { id: 'live', label: 'LIVE' },
  { id: 'hybrid', label: 'HYBRID' },
  { id: 'ai', label: 'AI' },
]

const sortedArchive = sortArchive(archive)

export default function Works() {
  const [filter, setFilter] = useState<Filter>('top')
  const [open, setOpen] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  const isTop = filter === 'top'
  const archiveVisible = sortedArchive.filter(
    (w) => filter === 'all' || w.type === filter,
  )
  const shown = isTop ? works.length : archiveVisible.length
  const total = isTop ? works.length : sortedArchive.length
  const hoveredWork = works.find((w) => w.id === hovered) ?? null

  return (
    <section
      id="works"
      className="relative border-t border-hair bg-ink px-5 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[1600px]">
        <SectionHead
          index="03 — WORKS"
          title="WORKS"
          lead="촬영한 것과 만든 것을 구분해서 표기합니다."
        />

        {/* 필터 */}
        <div className="mb-10 flex flex-wrap items-center gap-5 border-b border-hair pb-5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`relative py-1 font-mono text-[11px] tracking-[0.25em] transition-colors ${
                filter === f.id ? 'text-ivory' : 'text-steel hover:text-ash'
              }`}
            >
              {f.label}
              <span
                className={`absolute -bottom-0.5 left-0 h-px bg-amber transition-all duration-300 ${
                  filter === f.id ? 'w-full' : 'w-0'
                }`}
              />
            </button>
          ))}
          <span className="ml-auto font-mono text-[10px] tracking-[0.2em] text-steel">
            {String(shown).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </div>

        {!isTop && <ArchiveList key={filter} items={archiveVisible} />}

        {isTop && (
        <div className="relative grid gap-0 lg:grid-cols-[1fr_38%] lg:gap-12">
          {/* 목록 */}
          <ul className="border-t border-hair">
            {works.map((w) => (
              <WorkRow
                key={w.id}
                work={w}
                open={open === w.id}
                onToggle={() => setOpen(open === w.id ? null : w.id)}
                onHover={(on) => setHovered(on ? w.id : null)}
              />
            ))}
          </ul>

          {/* 데스크톱 전용 미리보기 — 마우스를 올린 작품의 루프 */}
          <div className="sticky top-24 hidden h-fit lg:block">
            <HoverPreview work={hoveredWork} />
          </div>
        </div>
        )}
      </div>
    </section>
  )
}

function WorkRow({
  work,
  open,
  onToggle,
  onHover,
}: {
  work: Work
  open: boolean
  onToggle: () => void
  onHover: (on: boolean) => void
}) {
  const reduced = usePrefersReducedMotion()
  const mobileVideo = useRef<HTMLVideoElement>(null)
  const [noteOn, setNoteOn] = useState(false)

  // 모바일 — 화면에 들어온 행의 루프만 재생
  useEffect(() => {
    const v = mobileVideo.current
    if (!v || reduced) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && window.innerWidth < 1024) {
          claim(v)
          v.play().catch(() => {})
        } else {
          v.pause()
          release(v)
        }
      },
      { threshold: 0.6 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [reduced])

  return (
    <li className="border-b border-hair">
      <button
        type="button"
        onClick={onToggle}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        onFocus={() => onHover(true)}
        onBlur={() => onHover(false)}
        aria-expanded={open}
        className="group flex w-full items-start gap-4 py-7 text-left transition-colors hover:bg-ink-2 md:gap-8 md:py-9"
      >
        <span className="mt-1 font-mono text-[11px] tracking-[0.2em] text-steel transition-colors group-hover:text-amber">
          {work.no}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block font-display text-xl leading-tight font-bold tracking-tight text-ivory sm:text-2xl md:text-3xl lg:text-4xl">
            {work.title}
          </span>
          <span className="mt-1.5 block text-sm text-ash md:text-base">
            「{work.subtitle}」
          </span>

          {/* 모바일 루프 */}
          <span className="mt-4 block aspect-video w-full overflow-hidden bg-ink-2 lg:hidden">
            <video
              ref={mobileVideo}
              className="h-full w-full object-cover"
              src={work.loop}
              poster={work.poster}
              muted
              loop
              playsInline
              preload="none"
            />
          </span>

          <span className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] tracking-[0.18em] text-steel md:hidden">
            <span>{work.period}</span>
            <span>{work.crew}</span>
          </span>
        </span>

        <span className="flex shrink-0 flex-col items-end gap-2.5 md:gap-3">
          <span className="hidden text-right font-mono text-[10px] tracking-[0.18em] text-steel md:block">
            {work.period}
            <br />
            {work.role}
          </span>
          <span
            onMouseEnter={() => setNoteOn(true)}
            onMouseLeave={() => setNoteOn(false)}
            className="relative"
          >
            <WorkTag type={work.type} />
            <span
              className={`pointer-events-none absolute right-0 top-full z-20 mt-2 w-60 border border-hair bg-ink-2 p-3 text-left text-[11px] leading-relaxed text-ash transition-opacity duration-200 ${
                noteOn ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {work.tagNote}
            </span>
          </span>
          <span className="font-mono text-[10px] tracking-[0.2em] text-steel transition-colors group-hover:text-ivory">
            {open ? '닫기 —' : '자세히 +'}
          </span>
        </span>
      </button>

      {open && <WorkDetail work={work} />}
    </li>
  )
}

function WorkDetail({ work }: { work: Work }) {
  return (
    <div className="grid gap-8 border-t border-hair bg-ink-2 px-1 py-8 md:grid-cols-[58%_1fr] md:gap-12 md:px-6 md:py-10">
      <div>
        <YouTubeEmbed
          id={work.youtubeId}
          title={`${work.title} 「${work.subtitle}」`}
          poster={work.poster}
        />
        <a
          href={youtubeWatchUrl(work.youtubeId)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block font-mono text-[10px] tracking-[0.2em] text-steel transition-colors hover:text-amber"
        >
          YOUTUBE에서 보기 ↗
        </a>
      </div>

      <dl className="space-y-5 text-sm">
        <Row label="기간" value={work.period} />
        <Row label="역할" value={work.role} />
        <Row label="참여" value={work.crew} />
        <Row
          label="CAMERA"
          value={work.camera.length ? work.camera.join(' · ') : '— 촬영 없음'}
        />
        <Row
          label="MODEL"
          value={work.model.length ? work.model.join(' · ') : '— 생성 없음'}
        />
        <Row
          label="EDIT"
          value={work.edit.length ? work.edit.join(' · ') : '—'}
        />
        <div>
          <dt className="font-mono text-[10px] tracking-[0.25em] text-steel">
            NOTE
          </dt>
          <dd className="mt-2 leading-relaxed text-ash">
            {work.description || (
              <span className="text-steel">
                TODO: 이 작품의 작업 설명 한 문단 — src/content.ts 의
                description 에 적으세요.
              </span>
            )}
          </dd>
        </div>
      </dl>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[84px_1fr] items-baseline gap-4 border-b border-hair pb-4">
      <dt className="font-mono text-[10px] tracking-[0.25em] text-steel">
        {label}
      </dt>
      <dd className="text-ivory/90">{value}</dd>
    </div>
  )
}

function HoverPreview({ work }: { work: Work | null }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v || !work) return
    v.load()
    claim(v)
    v.play().catch(() => {})
    return () => {
      v.pause()
      release(v)
    }
  }, [work])

  if (!work) {
    return (
      <div className="flex aspect-video w-full items-center justify-center border border-hair">
        <p className="font-mono text-[10px] tracking-[0.25em] text-steel">
          HOVER A WORK
        </p>
      </div>
    )
  }

  return (
    <figure>
      <div className="aspect-video w-full overflow-hidden bg-ink-2">
        <video
          ref={videoRef}
          key={work.id}
          className="h-full w-full object-cover"
          src={work.loop}
          poster={work.poster}
          muted
          loop
          playsInline
          preload="none"
        />
      </div>
      <figcaption className="mt-3 flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-steel">
        <span>{work.no}</span>
        <span>{work.crew}</span>
      </figcaption>
    </figure>
  )
}
