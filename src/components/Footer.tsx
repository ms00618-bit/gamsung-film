import { brand, contact, sections } from '../content'

const links = sections.filter((s) => s.id !== 'hero')

export default function Footer() {
  return (
    <footer className="border-t border-hair bg-ink px-5 py-12 md:px-10">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-display text-base font-bold tracking-[0.18em] text-ivory">
              {brand.team.toUpperCase()}
            </p>
            <p className="mt-2 font-mono text-[10px] tracking-[0.2em] text-steel">
              {brand.name} · {brand.roleline}
            </p>
          </div>

          <nav aria-label="푸터 메뉴">
            <ul className="flex flex-wrap gap-x-7 gap-y-3">
              {links.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="font-mono text-[10px] tracking-[0.2em] text-ash transition-colors hover:text-ivory"
                  >
                    {s.label.toUpperCase()}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={contact.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[10px] tracking-[0.2em] text-ash transition-colors hover:text-ivory"
                >
                  INSTAGRAM
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="font-mono text-[10px] tracking-[0.2em] text-ash transition-colors hover:text-ivory"
                >
                  EMAIL
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-hair pt-6 font-mono text-[10px] tracking-[0.15em] text-steel sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {brand.team}. ALL RIGHTS RESERVED.</p>
          <p>개인정보 처리방침</p>
        </div>
      </div>
    </footer>
  )
}
