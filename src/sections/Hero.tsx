import { brand } from '../content'

/**
 * 히어로 — 한 화면짜리 표지.
 * 영상은 페이지 전체 배경(components/Backdrop.tsx)이 맡고,
 * 여기서는 이름과 카피, 버튼만 얹는다.
 */
export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex h-screen w-full items-end overflow-hidden"
      aria-label="히어로"
    >
      {/* 글씨가 읽히도록 아래쪽을 어둡게 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-linear-to-t from-ink via-ink/70 to-transparent"
      />

      <div className="relative z-10 w-full px-6 pb-24 md:px-16 md:pb-20">
        <p className="font-mono text-[11px] tracking-[0.35em] text-ash">
          {brand.name.toUpperCase()}
        </p>
        <h1 className="mt-4 max-w-4xl font-display text-[2rem] leading-[1.08] font-bold tracking-tight whitespace-pre-line text-ivory sm:text-5xl md:text-6xl lg:text-7xl">
          {brand.headline}
        </h1>
        {brand.sub && (
          <p className="mt-4 max-w-xl text-sm text-ash md:text-base">
            {brand.sub}
          </p>
        )}
        <p className="mt-4 font-mono text-[11px] tracking-[0.25em] text-steel">
          {brand.roleline}
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <a
            href="#reel"
            className="inline-flex items-center justify-center border border-ivory/70 px-7 py-3.5 font-mono text-xs tracking-[0.2em] text-ivory transition-colors duration-200 hover:bg-ivory hover:text-ink"
          >
            릴 보기
          </a>
          <a
            href="#works"
            className="inline-flex items-center justify-center border border-hair px-7 py-3.5 font-mono text-xs tracking-[0.2em] text-ash transition-colors duration-200 hover:border-amber hover:text-amber"
          >
            작품 보기
          </a>
        </div>
      </div>

      {/* 스크롤 안내 */}
      <div className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-center">
        <p className="font-mono text-[10px] tracking-[0.3em] text-ash">SCROLL</p>
        <div className="mx-auto mt-2 h-8 w-px bg-linear-to-b from-ash to-transparent" />
      </div>
    </section>
  )
}
