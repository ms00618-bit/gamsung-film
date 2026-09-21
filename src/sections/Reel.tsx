import { reelWorkId, works } from '../content'
import { SectionHead } from '../components/SectionHead'
import { YouTubeEmbed, youtubeWatchUrl } from '../components/YouTubeEmbed'

const reel = works.find((w) => w.id === reelWorkId) ?? works[0]

export default function Reel() {
  return (
    <section
      id="reel"
      className="relative border-t border-hair bg-ink px-5 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[1600px]">
        <SectionHead
          index="02 — THE REEL"
          title="THE REEL"
          lead="실사와 생성이 같은 타임라인에 올라간 결과."
        />

        <figure className="mx-auto w-full md:w-[86%]">
          <YouTubeEmbed
            id={reel.youtubeId}
            title={`${reel.title} 「${reel.subtitle}」`}
            poster={reel.poster}
            label="PLAY REEL"
          />

          <figcaption className="mt-5 flex flex-col gap-2 font-mono text-[11px] tracking-wider text-steel md:flex-row md:items-baseline md:justify-between">
            <span className="text-ash">
              {reel.title} 「{reel.subtitle}」
            </span>
            <span>
              {reel.period} · {reel.role} ·{' '}
              {[...reel.camera, ...reel.model, ...reel.edit].join(' / ')}
            </span>
          </figcaption>
          <a
            href={youtubeWatchUrl(reel.youtubeId)}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block font-mono text-[10px] tracking-[0.2em] text-steel transition-colors hover:text-amber"
          >
            YOUTUBE에서 보기 ↗
          </a>
        </figure>
      </div>
    </section>
  )
}
