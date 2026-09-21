import type { ReactNode } from 'react'

export function SectionHead({
  index,
  title,
  lead,
  children,
}: {
  index: string
  title: ReactNode
  lead?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="mb-14 md:mb-20">
      <p className="font-mono text-[10px] tracking-[0.35em] text-steel">
        {index}
      </p>
      <h2 className="mt-4 font-display text-3xl leading-[1.05] font-bold tracking-tight text-ivory whitespace-pre-line sm:text-4xl md:text-5xl lg:text-6xl">
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
