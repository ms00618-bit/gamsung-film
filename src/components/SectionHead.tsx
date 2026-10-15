import type { ReactNode } from 'react'

export function SectionHead({
  index,
  title,
  lead,
  children,
  /** 제목 글자 크기를 바꾸고 싶을 때만 넣습니다 */
  titleClass = 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
}: {
  index: string
  title: ReactNode
  lead?: ReactNode
  children?: ReactNode
  titleClass?: string
}) {
  return (
    <div className="mb-14 md:mb-20">
      <p className="font-mono text-[10px] tracking-[0.35em] text-steel">
        {index}
      </p>
      <h2
        className={`mt-4 font-display leading-[1.05] font-bold tracking-tight text-ivory whitespace-pre-line ${titleClass}`}
      >
        {title}
      </h2>
      {lead && (
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-ash md:text-base">
          {lead}
        </p>
      )}
      {children}
    </div>
  )
}

export function Rule() {
  return <div className="h-px w-full bg-hair" />
}
