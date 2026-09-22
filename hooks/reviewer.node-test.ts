import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import type { ModelCompleteResult } from 'claude-code'
import { raceDeadline } from './deadline.ts'
import { bestEffortStatus, DEFAULT_MODEL, selectedModel } from './register.ts'
import {
  canonical,
  fingerprint,
  reviewPending,
  sanitize,
  ReviewFailure,
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

const usage = {
  input_tokens: 1,
  output_tokens: 1,
  cache_read_input_tokens: 0,
  cache_creation_input_tokens: 0,
}

const answered = (text: string): ModelCompleteResult => ({
  isAnswered: true,
  text,
  usage,
})

const emptyReply: ModelCompleteResult = {
  isAnswered: false,
  reason: 'empty-reply',
  usage,
}

const apiError: ModelCompleteResult = {
  isAnswered: false,
  reason: 'api-error',
  status: 529,
  error: 'overloaded',
  usage,
}

const hostWithResults = (results: ModelCompleteResult[]): ReviewHost => ({
  complete: async () => {
    const result = results.shift()
    if (result === undefined) throw new Error('unexpected completion')
    return result
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

const hostWithReplies = (replies: string[]): ReviewHost =>
  hostWithResults(replies.map(answered))

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

test('reviews code mutations as operational permissions, not application design', async () => {
  let system = ''
  const host = hostWithReplies([
    assessment({
      risk: 'High',
      authorization: 'High',
      reason: 'The owner directly requested this narrowly scoped code change.',
    }),
  ])
  const complete = host.complete
  host.complete = request => {
    system = request.system ?? ''
    return complete(request)
  }

  const result = await reviewPending(host, {
    ...baseInput(),
    tool: 'Edit',
    input: {
      file_path: '/work/tests/MailWebhookTest.php',
      old_string: "->middleware('throttle:mail-webhook')",
      new_string: '',
    },
    ownerMessages: [
      {
        id: 'u1',
        original: 'Remove rate limiting from the mail webhook and update its test.',
        at: 1,
      },
    ],
  })

  assert.equal(result.allow, true)
  assert.match(system, /operational permission review, not a code review/)
  assert.match(system, /owner does not need to enumerate every file, line, assertion/)
  assert.match(system, /possible runtime behavior of source code/)
})

test('permits one bounded evidence round and requires final assessment output', async () => {
  const need = JSON.stringify({
    type: 'need_evidence',
    requests: [{ operation: 'read', path: 'README.md' }],
  })
  const prompts: string[] = []
  const host = hostWithReplies([need, assessment({ evidenceIds: ['u1', 'f1'] })])
  const complete = host.complete
  host.complete = async request => {
    prompts.push(request.prompt)
    return complete(request)
  }
  const result = await reviewPending(host, baseInput())
  assert.equal(result.allow, true)
  assert.equal(result.attempts, 2)
  assert.match(prompts[1]!, /assessment object only/)

  await assert.rejects(
    reviewPending(hostWithReplies([need, need]), baseInput()),
    error => {
      const failure = error as ReviewFailure
      assert.equal(failure.code, 'evidence-round-exhausted')
      assert.equal(failure.attempts, 2)
      return true
    },
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

test('repairs one invalid protocol response without changing the request', async () => {
  const prompts: string[] = []
  let calls = 0
  const host = hostWithReplies(['not json', assessment()])
  const complete = host.complete
  host.complete = async request => {
    calls += 1
    prompts.push(request.prompt)
    return complete(request)
  }
  const result = await reviewPending(host, baseInput())
  assert.equal(result.allow, true)
  assert.equal(result.attempts, 2)
  assert.equal(calls, 2)
  assert.match(prompts[1]!, /not-json/)
  assert.doesNotMatch(prompts[1]!, /not json/)
})

test('keeps the request and records payload frozen across protocol repair', async () => {
  const prompts: string[] = []
  const host = hostWithReplies(['not json', assessment()])
  const complete = host.complete
  host.complete = async request => {
    prompts.push(request.prompt)
    return complete(request)
  }

  await reviewPending(host, baseInput())
  const payload = (prompt: string) => {
    const start = prompt.indexOf('\n{"request":')
    const end = prompt.indexOf('\nOutput one raw JSON object', start)
    assert.notEqual(start, -1)
    assert.notEqual(end, -1)
    return JSON.parse(prompt.slice(start + 1, end))
  }
  const first = payload(prompts[0]!)
  const second = payload(prompts[1]!)
  assert.deepEqual(second.request, first.request)
  assert.deepEqual(second.records, first.records)
})

test('repairs each bounded structured-output protocol error', async () => {
  const cases = [
    ['wrong-shape', JSON.stringify([])],
    ['invalid-assessment-shape', JSON.stringify({ type: 'assessment' })],
    [
      'invalid-evidence-shape',
      JSON.stringify({ type: 'need_evidence', requests: 'not-an-array' }),
    ],
    [
      'invalid-evidence-request',
      JSON.stringify({
        type: 'need_evidence',
        requests: [{ operation: 'read', path: 'README.md', extra: true }],
      }),
    ],
    [
      'invalid-enum',
      JSON.stringify({
        type: 'assessment',
        risk: 'Severe',
        authorization: 'Medium',
        narrowlyScoped: true,
        planCompatible: true,
        explicitProhibition: false,
        maliciousUntrustedInstruction: false,
        decisionCriticalUncertainty: false,
        reason: 'Read-only inspection supports the task.',
        evidenceIds: ['u1'],
      }),
    ],
  ] as const

  for (const [code, invalid] of cases) {
    const prompts: string[] = []
    const host = hostWithReplies([invalid, assessment()])
    const complete = host.complete
    host.complete = async request => {
      prompts.push(request.prompt)
      return complete(request)
    }

    const result = await reviewPending(host, baseInput())
    assert.equal(result.allow, true, code)
    assert.equal(result.attempts, 2, code)
    assert.match(prompts[1]!, new RegExp(code), code)
  }
})

test('does not retry protocol errors outside the bounded repair classes', async () => {
  let calls = 0
  const invalid = JSON.stringify({
    type: 'assessment',
    risk: 'Low',
    authorization: 'Medium',
    narrowlyScoped: true,
    planCompatible: true,
    explicitProhibition: false,
    maliciousUntrustedInstruction: false,
    decisionCriticalUncertainty: false,
    reason: '',
    evidenceIds: ['u1'],
  })
  const host = hostWithReplies([invalid, assessment()])
  const complete = host.complete
  host.complete = async request => {
    calls += 1
    return complete(request)
  }

  await assert.rejects(
    reviewPending(host, baseInput()),
    error => {
      const failure = error as ReviewFailure
      assert.equal(failure.code, 'invalid-reason')
      assert.equal(failure.attempts, 1)
      return true
    },
  )
  assert.equal(calls, 1)
})

test('fails evidence infrastructure errors without a second completion', async () => {
  const need = JSON.stringify({
    type: 'need_evidence',
    requests: [{ operation: 'read', path: 'README.md' }],
  })
  let completions = 0
  const host = hostWithReplies([need])
  host.complete = async () => {
    completions += 1
    return answered(need)
  }
  host.stat = async () => {
    throw new Error('evidence backend unavailable')
  }

  await assert.rejects(
    reviewPending(host, baseInput()),
    error => {
      const failure = error as ReviewFailure
      assert.equal(failure.code, 'evidence-failed')
      assert.equal(failure.attempts, 1)
      return true
    },
  )
  assert.equal(completions, 1)
})

test('does not gather evidence when the initial repair budget is exhausted', async () => {
  const need = JSON.stringify({
    type: 'need_evidence',
    requests: [{ operation: 'read', path: 'README.md' }],
  })
  let completions = 0
  let evidenceCalls = 0
  const host = hostWithReplies(['not json', 'still not json', need])
  const complete = host.complete
  host.complete = async request => {
    completions += 1
    return complete(request)
  }
  host.stat = async path => {
    evidenceCalls += 1
    return {
      kind: path.endsWith('.md') ? 'file' : 'dir',
      size: 7,
      mtimeMs: 1,
      isLink: false,
      realPath: path,
    }
  }

  await assert.rejects(
    reviewPending(host, baseInput()),
    error => {
      const failure = error as ReviewFailure
      assert.equal(failure.code, 'attempt-budget-exhausted')
      assert.equal(failure.attempts, 3)
      return true
    },
  )
  assert.equal(completions, 3)
  assert.equal(evidenceCalls, 0)
})


test('stops after three invalid protocol responses', async () => {
  let calls = 0
  const host = hostWithReplies(['not json', 'still not json', 'again not json'])
  const complete = host.complete
  host.complete = async request => {
    calls += 1
    return complete(request)
  }
  await assert.rejects(
    reviewPending(host, baseInput()),
    error => {
      const failure = error as ReviewFailure
      assert.equal(failure.code, 'not-json')
      assert.equal(failure.attempts, 3)
      return true
    },
  )
  assert.equal(calls, 3)
})

test('does not retry a valid denial', async () => {
  let calls = 0
  const host = hostWithReplies([
    assessment({
      explicitProhibition: true,
      reason: 'The owner explicitly prohibited this action.',
    }),
  ])
  const complete = host.complete
  host.complete = async request => {
    calls += 1
    return complete(request)
  }
  const result = await reviewPending(host, baseInput())
  assert.equal(result.allow, false)
  assert.equal(result.attempts, 1)
  assert.equal(calls, 1)
})

test('shares the repair budget across evidence and final assessment', async () => {
  const need = JSON.stringify({
    type: 'need_evidence',
    requests: [{ operation: 'read', path: 'README.md' }],
  })
  const prompts: string[] = []
  const host = hostWithReplies([need, 'not json', assessment({ evidenceIds: ['u1', 'f1'] })])
  const complete = host.complete
  host.complete = async request => {
    prompts.push(request.prompt)
    return complete(request)
  }
  const result = await reviewPending(host, baseInput())
  assert.equal(result.allow, true)
  assert.equal(result.attempts, 3)
  assert.match(prompts[1]!, /assessment object only/)
  assert.match(prompts[2]!, /not-json/)
})

test('stale context stops protocol repair', async () => {
  let fresh = true
  let calls = 0
  const host = hostWithReplies(['not json', assessment()])
  const complete = host.complete
  host.complete = async request => {
    calls += 1
    const result = await complete(request)
    fresh = false
    return result
  }
  await assert.rejects(
    reviewPending(
      host,
      {
        ...baseInput(),
        isFresh: () => fresh,
      },
    ),
    error => {
      const failure = error as ReviewFailure
      assert.equal(failure.code, 'review-stale')
      assert.equal(failure.attempts, 1)
      return true
    },
  )
  assert.equal(calls, 1)
})

test('model completion errors are not retried', async () => {
  let calls = 0
  const host = hostWithReplies([])
  host.complete = async () => {
    calls += 1
    throw new Error('provider unavailable')
  }
  await assert.rejects(
    reviewPending(host, baseInput()),
    error => {
      const failure = error as ReviewFailure
      assert.equal(failure.code, 'model-completion-failed')
      assert.equal(failure.attempts, 1)
      return true
    },
  )
  assert.equal(calls, 1)
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

test('treats an empty native reply as retryable protocol output', async () => {
  const host = hostWithResults([emptyReply, answered(assessment())])
  const result = await reviewPending(host, baseInput())
  assert.equal(result.allow, true)
  assert.equal(result.attempts, 2)
})

test('does not retry an unanswered native provider result', async () => {
  const host = hostWithResults([apiError, answered(assessment())])
  await assert.rejects(
    reviewPending(host, baseInput()),
    error => {
      const failure = error as ReviewFailure
      assert.equal(failure.kind, 'model')
      assert.equal(failure.code, 'model-completion-failed')
      assert.equal(failure.attempts, 1)
      return true
    },
  )
})
