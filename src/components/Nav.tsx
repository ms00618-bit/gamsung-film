import { useEffect, useState } from 'react'
import { brand, sections } from '../content'

const links = sections.filter((s) => s.id !== 'hero')
/** 좁은 화면에서는 이 세 개만 보여준다 */
const COMPACT = ['reel', 'works', 'about']

export default function Nav() {
  const [solid, setSolid] = useState(false)
  const [active, setActive] = useState('hero')

  useEffect(() => {
    const hero = document.getElementById('hero')
    if (!hero) return
    const io = new IntersectionObserver(
      ([e]) => setSolid(!e.isIntersecting),
      { rootMargin: '-90% 0px 0px 0px' },
    )
    io.observe(hero)
    return () => io.disconnect()
  }, [])

  // 화면 위쪽 35% 선이 지나가는 섹션을 현재 섹션으로 본다.
  // 스크롤 이벤트에서 직접 계산하지 않고 rAF 로 한 프레임에 한 번만 갱신한다.
  useEffect(() => {
    let ticking = false

    const update = () => {
      ticking = false
      const line = window.innerHeight * 0.35
      let found = sections[0].id
      for (const s of sections) {
        const el = document.getElementById(s.id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (rect.top <= line && rect.bottom > line) {
          found = s.id
          break
        }
      }
      setActive((prev) => (prev === found ? prev : found))
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solid ? 'bg-ink/95 backdrop-blur-[2px]' : 'bg-transparent'
      }`}
    >
      <nav
        className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-5 md:h-16 md:px-10"
        aria-label="주요 메뉴"
      >
        <a
          href="#hero"
          className="font-display text-sm font-bold tracking-[0.18em] text-ivory md:text-base"
        >
          {brand.team.toUpperCase()}
        </a>

        <ul className="flex items-center gap-4 md:gap-7">
          {links.map((s) => (
            <li
              key={s.id}
              className={COMPACT.includes(s.id) ? '' : 'hidden sm:block'}
            >
              <a
                href={`#${s.id}`}
                className="group relative block py-2 font-mono text-[10px] tracking-[0.2em] text-ash transition-colors hover:text-ivory md:text-[11px]"
                aria-current={active === s.id ? 'true' : undefined}
              >
                {s.label.toUpperCase()}
                <span
                  className={`absolute -bottom-0.5 left-0 h-px bg-amber transition-all duration-300 ${
                    active === s.id ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div
        className={`h-px w-full transition-opacity duration-500 ${
          solid ? 'bg-hair opacity-100' : 'opacity-0'
        }`}
      />
    </header>
  )
}
