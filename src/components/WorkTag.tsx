import type { WorkType } from '../content'

export const TYPE_LABEL: Record<WorkType, string> = {
  live: 'LIVE',
  hybrid: 'HYBRID',
  ai: 'AI',
}

/** LIVE = 앰버, AI = 실버, HYBRID = 두 색이 좌우로 나뉜 얇은 선 */
export function WorkTag({
  type,
  className = '',
}: {
  type: WorkType
  className?: string
}) {
  const base =
    'relative inline-block px-2.5 py-1 font-mono text-[10px] tracking-[0.2em]'

  if (type === 'hybrid') {
    return (
      <span className={`${base} text-ivory ${className}`}>
        <span className="pointer-events-none absolute inset-0">
          <span className="absolute inset-y-0 left-0 w-1/2 border-y border-l border-amber" />
          <span className="absolute inset-y-0 right-0 w-1/2 border-y border-r border-silver" />
        </span>
        {TYPE_LABEL[type]}
      </span>
    )
  }

  const color = type === 'live' ? 'border-amber text-amber' : 'border-silver text-silver'
  return (
    <span className={`${base} border ${color} ${className}`}>
      {TYPE_LABEL[type]}
    </span>
  )
}
