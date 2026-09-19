import { expect, mock, test, tier } from 'claude-code/testing'

tier('user')

test('startup capability check uses the sonnet alias', async ($, on) => {
  mock.clock(on)
  mock.store(on)
  let request: Record<string, unknown> | undefined
  on('session.id', () => ({ value: 'session-startup-sonnet' }))
  on('session.messages', () => ({ value: [] }))
  on('model.complete', (_core, event) => {
    request = event
    return { value: 'ok' }
  })
  on('command.register', () => ({ value: {} }))
  on('ui.status', () => ({ value: null }))
  on('session.start', () => ({ cwd: '/work' }))

  await expect($.session.start({ cwd: '/work' })).resolves.toEqual({ cwd: '/work' })
  expect(request?.model).toBe('sonnet')
  expect(request?.effort).toBeUndefined()
  expect(request?.thinking).toBeUndefined()
})

test('startup model failure reports unavailable without fallback', async ($, on) => {
  mock.clock(on)
  mock.store(on)
  const statuses: string[] = []
  let modelRequests = 0
  on('session.id', () => ({ value: 'session-startup-failure' }))
  on('session.messages', () => ({ value: [] }))
  on('model.complete', () => {
    modelRequests += 1
    return { deny: 'model unavailable' }
  })
  on('command.register', () => ({ value: {} }))
  on('ui.status', (_core, event) => {
    statuses.push(event.text)
    return { value: null }
  })
  on('session.start', () => ({ cwd: '/work' }))

  await expect($.session.start({ cwd: '/work' })).resolves.toEqual({ cwd: '/work' })
  expect(statuses).toEqual([
    'approval reviewer checking',
    'approval reviewer unavailable — covered asks deny',
  ])
  expect(modelRequests).toBe(1)
})

test('preserves a downstream allow decision', async ($, on) => {
  on('tool.check', () => ({ decision: 'allow' }))
  await expect(
    $.tool.check({ tool: 'Example', input: {} }),
  ).resolves.toEqual({ decision: 'allow' })
})

test('preserves a downstream deny decision', async ($, on) => {
  on('tool.check', () => ({ decision: 'deny' }))
  await expect(
    $.tool.check({ tool: 'Example', input: {} }),
  ).resolves.toEqual({ decision: 'deny' })
})

test('turns a pending ExitPlanMode ask into a final deny', async ($, on) => {
  mock.clock(on)
  mock.store(on)
  on('session.id', () => ({ value: 'session-plan' }))
  on('tool.check', () => ({ decision: 'ask', reason: 'Exit plan mode?' }))

  await expect(
    $.tool.check({ tool: 'ExitPlanMode', input: { plan: 'Implement it.' } }),
  ).resolves.toEqual({
    decision: 'deny',
    reason: 'Approval reviewer does not approve leaving Plan mode.',
  })
})

test('an uncorrelated pending ask fails closed', async ($, on) => {
  on('session.id', () => {
    throw new Error('injected session failure')
  })
  on('tool.check', () => ({ decision: 'ask' }))

  await expect(
    $.tool.check({ tool: 'Example', input: {} }),
  ).resolves.toEqual({
    decision: 'deny',
    reason:
      'Approval reviewer unavailable (context-integrity); this request was denied.',
  })
})
