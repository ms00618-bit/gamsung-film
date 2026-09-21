import { useState } from 'react'
import { about, brand } from '../content'
import { SectionHead } from '../components/SectionHead'

export default function About() {
  return (
    <section
      id="about"
      className="relative border-t border-hair bg-ink px-5 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[1600px]">
        <SectionHead
          index="06 — ABOUT"
          title={'NOT A CAMERA OPERATOR.\nNOT A PROMPTER.'}
        />

        <div className="grid gap-14 md:grid-cols-[42%_1fr] md:gap-20">
          <div>
            <p className="max-w-md font-display text-xl leading-[1.5] font-bold tracking-tight text-ivory md:text-2xl">
              감성있게 기획하고.
                <br />
              찍을 수 있는 장면은 찍고.
              <br />
              없는 장면은 만든다.
              <br />
              편집은 자연스럽게.
            </p>

            <div className="mt-10 border-t border-hair pt-6">
              <p className="font-mono text-[10px] tracking-[0.25em] text-steel">
                {brand.name.toUpperCase()}
              </p>
              <p className="mt-2 text-sm text-ash">
                영상 디자이너 · 기획 · 촬영 · AI 생성 · 편집
              </p>
            </div>

            {/* 팀이 확정한 공식 문구 — 고치지 않는다 */}
            <div className="mt-8 border-t border-hair pt-6">
              <p className="font-mono text-[10px] tracking-[0.25em] text-steel">
                {brand.team}
              </p>
              <p className="mt-3 max-w-md text-[13px] leading-relaxed text-ash/75">
                {about.teamIntro[0]}
                <br />
                {about.teamIntro[1]}
              </p>
            </div>
          </div>

          {/* 촬영 장비와 AI 도구를 같은 비중으로 나란히 둔다 */}
          <div className="grid gap-10 sm:grid-cols-2">
            <ToolColumn
              title="CAMERA"
              accent="amber"
              items={about.cameraTools}
            />
            <ToolColumn title="MODEL" accent="silver" items={about.modelTools} />
            <div className="sm:col-span-2">
              <ToolColumn
                title="EDIT"
                accent="steel"
                items={about.editTools}
                inline
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ToolColumn({
  title,
  accent,
  items,
  inline = false,
}: {
  title: string
  accent: 'amber' | 'silver' | 'steel'
  items: { name: string; note: string }[]
  inline?: boolean
}) {
  const [open, setOpen] = useState<string | null>(null)
  const line =
    accent === 'amber'
      ? 'bg-amber'
      : accent === 'silver'
        ? 'bg-silver'
        : 'bg-steel'

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className={`block h-px w-6 ${line}`} />
        <p className="font-mono text-[10px] tracking-[0.3em] text-ash">
          {title}
        </p>
      </div>

      <ul className={inline ? 'mt-5 flex flex-wrap gap-x-8 gap-y-3' : 'mt-5 space-y-3'}>
        {items.map((item) => (
          <li key={item.name}>
            <button
              type="button"
              onMouseEnter={() => setOpen(item.name)}
              onMouseLeave={() => setOpen(null)}
              onFocus={() => setOpen(item.name)}
              onBlur={() => setOpen(null)}
              onClick={() => setOpen(open === item.name ? null : item.name)}
              aria-expanded={open === item.name}
              className="block text-left font-mono text-xs tracking-[0.1em] text-ivory/85 transition-colors hover:text-ivory"
            >
              {item.name}
            </button>
            <p
              className={`overflow-hidden text-[11px] leading-relaxed text-steel transition-all duration-300 ${
                open === item.name ? 'mt-1.5 max-h-12 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              {item.note}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
