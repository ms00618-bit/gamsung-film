/**
 * 메뉴와 버튼(#reel, #works 같은 링크)을 누르면
 * 화면이 툭 바뀌는 대신 스크롤이 천천히 내려가게 한다.
 * - 거리가 멀수록 조금 더 오래 걸린다 (최대 3.2초)
 * - 사용자가 중간에 직접 스크롤하면 바로 멈춘다
 * - '동작 줄이기' 설정이 켜져 있으면 예전처럼 바로 이동한다
 */
export function installSmoothScroll() {
  let raf = 0
  const stop = () => cancelAnimationFrame(raf)

  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const link = (e.target as HTMLElement)?.closest?.(
      'a[href^="#"]',
    ) as HTMLAnchorElement | null
    if (!link) return
    // data-instant 가 붙은 링크(로고)는 예전처럼 바로 이동한다
    if (link.dataset.instant !== undefined) return
    const id = link.getAttribute('href')?.slice(1)
    if (!id) return
    const el = document.getElementById(id)
    if (!el) return

    e.preventDefault()
    const from = window.scrollY
    const max = document.documentElement.scrollHeight - window.innerHeight
    const to = Math.max(0, Math.min(el.getBoundingClientRect().top + from, max))
    const dist = to - from

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || Math.abs(dist) < 4) {
      window.scrollTo(0, to)
      history.replaceState(null, '', `#${id}`)
      return
    }

    const duration = Math.min(3200, Math.max(1000, Math.abs(dist) * 1.1))
    const startedAt = performance.now()
    stop()

    const step = (now: number) => {
      const t = Math.min((now - startedAt) / duration, 1)
      // 천천히 출발해 천천히 멈춘다
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      window.scrollTo(0, from + dist * eased)
      if (t < 1) raf = requestAnimationFrame(step)
      else history.replaceState(null, '', `#${id}`)
    }
    raf = requestAnimationFrame(step)
  }

  document.addEventListener('click', onClick)
  window.addEventListener('wheel', stop, { passive: true })
  window.addEventListener('touchstart', stop, { passive: true })
  window.addEventListener('keydown', stop)

  return () => {
    stop()
    document.removeEventListener('click', onClick)
    window.removeEventListener('wheel', stop)
    window.removeEventListener('touchstart', stop)
    window.removeEventListener('keydown', stop)
  }
}
