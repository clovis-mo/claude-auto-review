import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { raceDeadline } from './deadline.ts'
import { bestEffortStatus, DEFAULT_MODEL, selectedModel } from './register.ts'
import {
  canonical,
  fingerprint,
  reviewPending,
  sanitize,
  type ReviewHost,
  type ReviewInput,
} from './reviewer.ts'

const baseInput = (): ReviewInput => ({
  model: 'sonnet',
  requestId: 'request-1',
  sessionId: 'session-1',
  tool: 'Read',
  input: { file_path: 'README.md' },
  cwd: '/work',
  root: '/work',
  planMode: false,
  ownerMessages: [{ id: 'u1', original: 'Inspect the repository.', at: 1 }],
  transcript: [],
  isFresh: () => true,
})

const hostWithReplies = (replies: string[]): ReviewHost => ({
  complete: async () => {
    const reply = replies.shift()
    if (reply === undefined) throw new Error('unexpected completion')
    return reply
  },
  stat: async path => ({
    kind: path.endsWith('.md') ? 'file' : 'dir',
    size: path.endsWith('.md') ? 7 : 0,
    mtimeMs: 1,
    isLink: false,
    realPath: path.startsWith('/') ? path : `/work/${path}`,
  }),
  list: async () => [],
  read: async () => '# readme',
})

const assessment = (extra: Record<string, unknown> = {}) =>
  JSON.stringify({
    type: 'assessment',
    risk: 'Low',
    authorization: 'Medium',
    narrowlyScoped: true,
    planCompatible: true,
    explicitProhibition: false,
    maliciousUntrustedInstruction: false,
    decisionCriticalUncertainty: false,
    reason: 'Read-only inspection supports the task.',
    evidenceIds: ['u1'],
    ...extra,
  })

test('defaults both runtime and manifest configuration to the sonnet alias', () => {
  const manifest = JSON.parse(
    readFileSync(new URL('../.claude-plugin/plugin.json', import.meta.url), 'utf8'),
  )
  assert.equal(DEFAULT_MODEL, 'sonnet')
  assert.equal(manifest.userConfig.model.default, 'sonnet')
  assert.equal(selectedModel(undefined), 'sonnet')
  assert.equal(selectedModel('owner-model-override'), 'owner-model-override')
})

test('diagnostic status failures cannot replace a fail-closed decision', () => {
  const engine = {
    ui: {
      status() {
        throw new Error('injected status failure')
      },
    },
  }
  assert.doesNotThrow(() => bestEffortStatus(engine as never, 'unavailable'))
})

test('reviews directly and applies deterministic policy', async () => {
  const host = hostWithReplies([assessment()])
  const complete = host.complete
  host.complete = request => {
    assert.equal(request.model, 'sonnet')
    assert.equal('effort' in request, false)
    assert.equal('thinking' in request, false)
    return complete(request)
  }
  const result = await reviewPending(host, baseInput())
  assert.equal(result.allow, true)
  assert.equal(result.assessment.risk, 'Low')
})

test('passes an owner model override unchanged to native completion', async () => {
  const host = hostWithReplies([assessment()])
  const complete = host.complete
  host.complete = request => {
    assert.equal(request.model, 'owner-model-override')
    return complete(request)
  }
  await reviewPending(host, {
    ...baseInput(),
    model: selectedModel('owner-model-override'),
  })
})

test('keeps the oldest retained owner constraint in review context', async () => {
  let prompt = ''
  const host = hostWithReplies([
    assessment({
      explicitProhibition: true,
      reason: 'The retained owner constraint forbids this action.',
      evidenceIds: ['u1'],
    }),
  ])
  const complete = host.complete
  host.complete = async request => {
    prompt = request.prompt
    return complete(request)
  }
  const input = baseInput()
  input.ownerMessages = Array.from({ length: 65 }, (_, index) => ({
    id: `u${index + 1}`,
    original: index === 0 ? 'Never merge this pull request.' : `Context ${index + 1}`,
    at: index,
  }))

  const result = await reviewPending(host, input)
  assert.equal(result.allow, false)
  assert.match(prompt, /Never merge this pull request/)
})

test('uses plan compatibility only when the host signalled Plan mode', async () => {
  const reply = assessment({ planCompatible: false })
  assert.equal((await reviewPending(hostWithReplies([reply]), baseInput())).allow, true)
  assert.equal(
    (
      await reviewPending(hostWithReplies([reply]), {
        ...baseInput(),
        planMode: true,
      })
    ).allow,
    false,
  )
})

test('permits exactly one bounded evidence round', async () => {
  const need = JSON.stringify({
    type: 'need_evidence',
    requests: [{ operation: 'read', path: 'README.md' }],
  })
  const result = await reviewPending(
    hostWithReplies([need, assessment({ evidenceIds: ['u1', 'f1'] })]),
    baseInput(),
  )
  assert.equal(result.allow, true)

  await assert.rejects(
    reviewPending(hostWithReplies([need, need]), baseInput()),
    /second evidence request/,
  )
})

test('outside-scope evidence becomes an explicit gap', async () => {
  const prompts: string[] = []
  const host = hostWithReplies([
    JSON.stringify({
      type: 'need_evidence',
      requests: [{ operation: 'read', path: '/outside/secret' }],
    }),
    assessment({
      decisionCriticalUncertainty: true,
      reason: 'Requested evidence was outside the verified scope.',
      evidenceIds: ['f1'],
    }),
  ])
  const complete = host.complete
  host.complete = async request => {
    prompts.push(request.prompt)
    return complete(request)
  }
  const result = await reviewPending(host, baseInput())
  assert.equal(result.allow, false)
  assert.match(prompts[1]!, /outside the verified working scope/)
})

test('canonical fingerprints ignore object key order and history text is redacted', () => {
  assert.equal(canonical({ b: 2, a: 1 }), canonical({ a: 1, b: 2 }))
  assert.equal(fingerprint({ b: 2, a: 1 }), fingerprint({ a: 1, b: 2 }))
  assert.equal(sanitize('token=abc123456789'), 'token=[redacted]')
})

test('deadline settles once and ignores a late result', async () => {
  let fire: (() => void) | undefined
  let finish: ((value: string) => void) | undefined
  const pending = new Promise<string>(resolve => {
    finish = resolve
  })
  const result = raceDeadline(
    (_ms, fn) => {
      fire = fn
      return { cancel() {} }
    },
    pending,
    60_000,
  )
  fire?.()
  assert.deepEqual(await result, { timedOut: true })
  finish?.('late allow')
  assert.deepEqual(await result, { timedOut: true })
})

test('deadline cancels its timer after a fast result', async () => {
  let cancelled = false
  const result = await raceDeadline(
    () => ({
      cancel() {
        cancelled = true
      },
    }),
    Promise.resolve('ready'),
    60_000,
  )
  assert.deepEqual(result, { timedOut: false, value: 'ready' })
  assert.equal(cancelled, true)
})
