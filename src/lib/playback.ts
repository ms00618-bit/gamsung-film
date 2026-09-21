/** 한 번에 하나의 영상만 재생되게 한다 */
let current: HTMLVideoElement | null = null

export function claim(video: HTMLVideoElement) {
  if (current && current !== video) {
    current.pause()
  }
  current = video
}

export function release(video: HTMLVideoElement) {
  if (current === video) current = null
}

// ── 유튜브 재생기 ──────────────────────────────────────────────
// 유튜브 재생기는 하나만 열려 있게 한다. 새로 열면 나머지는 포스터로 돌아간다.
type Listener = (key: string) => void
const listeners = new Set<Listener>()

export function activateEmbed(key: string) {
  if (current) {
    current.pause()
    current = null
  }
  listeners.forEach((l) => l(key))
}

export function onEmbedActivate(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
