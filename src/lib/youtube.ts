/**
 * 유튜브 주소에서 영상 ID 를 꺼낸다.
 * youtu.be/ID, youtube.com/watch?v=ID, youtube.com/shorts/ID 모두 된다.
 * shorts 주소면 세로 영상으로 본다.
 */
export function parseYouTube(url: string): { id: string; vertical: boolean } | null {
  if (!url) return null
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/,
  )
  if (!m) return null
  return { id: m[1], vertical: /\/shorts\//.test(url) }
}

/** 목록용 작은 썸네일 (16:9) */
export const youtubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`

/** 재생 전 포스터 */
export const youtubePoster = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
