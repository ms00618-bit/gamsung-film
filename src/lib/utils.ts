export const clamp = (v: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, v))

/** a~b 구간에서 0~1 로 올라가는 값 */
export const ramp = (v: number, a: number, b: number) => clamp((v - a) / (b - a))

/** a에서 1로 올라갔다가 c~d에서 0으로 내려오는 값 */
export const band = (v: number, a: number, b: number, c: number, d: number) =>
  Math.min(ramp(v, a, b), 1 - ramp(v, c, d))

/** 'YYYY.MM' 두 개 사이의 개월 수 (양끝 포함) */
export const monthsBetween = (start: string, end: string) => {
  const [sy, sm] = start.split('.').map(Number)
  const [ey, em] = end.split('.').map(Number)
  return (ey - sy) * 12 + (em - sm) + 1
}
