import { useState } from 'react'
import type { ArchiveWork } from '../content'
import { WorkTag } from '../components/WorkTag'
import { YouTubeEmbed, youtubeWatchUrl } from '../components/YouTubeEmbed'
import { parseYouTube, youtubePoster, youtubeThumb } from '../lib/youtube'

/** 'YYYY.MM' 을 정렬용 숫자로 */
const monthKey = (s: string) => {
  const [y, m] = s.split('.').map(Number)
  return y * 12 + (m || 0)
}

/** 최신순 — 끝난 달, 그다음 시작한 달 기준 */
export function sortArchive(list: ArchiveWork[]) {
  return [...list].sort((a, b) => {
    const pa = a.period.match(/\d{4}\.\d{2}/g) ?? ['0.0']
    const pb = b.period.match(/\d{4}\.\d{2}/g) ?? ['0.0']
    const end = monthKey(pb[pb.length - 1]) - monthKey(pa[pa.length - 1])
    return end !== 0 ? end : monthKey(pb[0]) - monthKey(pa[0])
  })
}

export function ArchiveList({ items }: { items: ArchiveWork[] }) {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <ul className="border-t border-hair">
      {items.map((w, i) => {
        const key = `${w.title}|${w.subtitle}|${w.period}`
        return (
          <ArchiveRow
            key={key}
            no={String(i + 1).padStart(2, '0')}
            work={w}
            open={open === key}
            onToggle={() => setOpen(open === key ? null : key)}
          />
        )
      })}
    </ul>
  )
}

function ArchiveRow({
  no,
  work,
  open,
  onToggle,
}: {
  no: string
  work: ArchiveWork
  open: boolean
  onToggle: () => void
}) {
  const yt = parseYouTube(work.youtube)

  return (
    <li className="border-b border-hair">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="group flex w-full items-center gap-3 py-4 text-left transition-colors hover:bg-ink-2 md:gap-6 md:py-5"
      >
        <span className="hidden w-6 shrink-0 font-mono text-[10px] tracking-[0.2em] text-steel transition-colors group-hover:text-amber sm:block">
          {no}
        </span>

        {/* 썸네일 */}
        <span className="relative aspect-video w-24 shrink-0 overflow-hidden bg-ink-2 md:w-36">
          {yt ? (
            <img
              src={youtubeThumb(yt.id)}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center border border-hair font-mono text-[9px] tracking-[0.15em] text-steel">
              준비 중
            </span>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block font-display text-[15px] leading-snug font-bold tracking-tight text-ivory md:text-xl">
            {work.title}
          </span>
          {work.subtitle && (
            <span className="mt-0.5 block text-xs text-ash md:text-sm">
              「{work.subtitle}」
            </span>
          )}
          <span className="mt-1.5 block font-mono text-[10px] tracking-[0.15em] text-steel md:hidden">
            {work.period}
          </span>
        </span>

        <span className="flex shrink-0 flex-col items-end gap-2">
          <span className="hidden text-right font-mono text-[10px] tracking-[0.15em] text-steel md:block">
            {work.period}
            <br />
            {work.role}
          </span>
          <WorkTag type={work.type} />
        </span>
      </button>

      {open && <ArchiveDetail work={work} />}
    </li>
  )
}

function ArchiveDetail({ work }: { work: ArchiveWork }) {
  const yt = parseYouTube(work.youtube)
  const title = work.subtitle ? `${work.title} 「${work.subtitle}」` : work.title

  return (
    <div className="grid gap-8 border-t border-hair bg-ink-2 px-1 py-8 md:grid-cols-[58%_1fr] md:gap-12 md:px-6 md:py-10">
      <div>
        {yt ? (
          <>
            <YouTubeEmbed
              id={yt.id}
              title={title}
              poster={youtubePoster(yt.id)}
              vertical={yt.vertical}
            />
            <a
              href={youtubeWatchUrl(yt.id)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block font-mono text-[10px] tracking-[0.2em] text-steel transition-colors hover:text-amber"
            >
              YOUTUBE에서 보기 ↗
            </a>
          </>
        ) : (
          <div className="flex aspect-video w-full items-center justify-center border border-hair">
            <p className="font-mono text-[11px] tracking-[0.25em] text-steel">
              영상 준비 중
            </p>
          </div>
        )}
      </div>

      <dl className="space-y-5 text-sm">
        <Row label="기간" value={work.period} />
        <Row label="역할" value={work.role} />
        {work.crew && <Row label="참여" value={work.crew} />}
        <Row
          label="CAMERA"
          value={work.camera.length ? work.camera.join(' · ') : '—'}
        />
        <Row
          label="MODEL"
          value={work.model.length ? work.model.join(' · ') : '—'}
        />
        <Row label="EDIT" value={work.edit.length ? work.edit.join(' · ') : '—'} />
        {work.note && <Row label="NOTE" value={work.note} />}
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
