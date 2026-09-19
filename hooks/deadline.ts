import type { Timer } from 'claude-code'

export type After = (ms: number, fn: () => void) => Timer

export async function raceDeadline<T>(
  after: After,
  pending: Promise<T>,
  ms: number,
): Promise<{ timedOut: true } | { timedOut: false; value: T }> {
  let timer: Timer | undefined
  const deadline = new Promise<{ timedOut: true }>(resolve => {
    timer = after(Math.max(0, ms), () => resolve({ timedOut: true }))
  })
  const result = await Promise.race([
    pending.then(value => ({ timedOut: false as const, value })),
    deadline,
  ])
  timer?.cancel()
  return result
}
