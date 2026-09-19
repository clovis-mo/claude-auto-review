import assert from 'node:assert/strict'
import test from 'node:test'
import {
  AUTHORIZATIONS,
  RISKS,
  applyPolicy,
  parseReviewResponse,
  type Assessment,
} from './policy.ts'

const assessment = (overrides: Partial<Assessment> = {}): Assessment => ({
  type: 'assessment',
  risk: 'Low',
  authorization: 'Unknown',
  narrowlyScoped: true,
  planCompatible: true,
  explicitProhibition: false,
  maliciousUntrustedInstruction: false,
  decisionCriticalUncertainty: false,
  reason: 'bounded development action',
  evidenceIds: [],
  ...overrides,
})

test('applies the complete risk and authorization matrix', () => {
  for (const risk of RISKS) {
    for (const authorization of AUTHORIZATIONS) {
      const result = applyPolicy(assessment({ risk, authorization }))
      const expected =
        risk === 'Low' ||
        risk === 'Medium' ||
        (risk === 'High' && (authorization === 'High' || authorization === 'Medium'))
      assert.equal(result.allow, expected, `${risk}/${authorization}`)
    }
  }
  assert.equal(applyPolicy(assessment({ risk: 'High', narrowlyScoped: false })).allow, false)
})

test('overrides the matrix for restrictions and uncertainty', () => {
  for (const override of [
    { explicitProhibition: true },
    { maliciousUntrustedInstruction: true },
    { decisionCriticalUncertainty: true },
  ]) {
    assert.equal(applyPolicy(assessment(override)).allow, false)
  }
  assert.equal(applyPolicy(assessment({ planCompatible: false })).allow, true)
})

test('strictly parses assessments and evidence requests', () => {
  const known = new Set(['u1', 'f1'])
  const valid = JSON.stringify(assessment({ evidenceIds: ['u1'] }))
  assert.deepEqual(
    parseReviewResponse(valid, known),
    assessment({ evidenceIds: ['u1'] }),
  )
  assert.deepEqual(
    parseReviewResponse(`\`\`\`json\n${valid}\n\`\`\``, known),
    assessment({ evidenceIds: ['u1'] }),
  )
  assert.deepEqual(
    parseReviewResponse(
      JSON.stringify({
        type: 'need_evidence',
        requests: [{ operation: 'read', path: 'README.md' }],
      }),
      known,
    ),
    {
      type: 'need_evidence',
      requests: [{ operation: 'read', path: 'README.md' }],
    },
  )
})

test('rejects malformed, extra, oversized, and unknown evidence output', () => {
  const known = new Set(['u1'])
  const invalid = [
    `before ${JSON.stringify(assessment())}`,
    `\`\`\`\n${JSON.stringify(assessment())}\n\`\`\``,
    JSON.stringify({ ...assessment(), extra: true }),
    JSON.stringify(assessment({ risk: 'Severe' as Assessment['risk'] })),
    JSON.stringify(assessment({ evidenceIds: ['missing'] })),
    JSON.stringify(assessment({ reason: 'x'.repeat(501) })),
    JSON.stringify({ type: 'need_evidence', requests: [] }),
    JSON.stringify({
      type: 'need_evidence',
      requests: [
        { operation: 'read', path: 'a' },
        { operation: 'read', path: 'a' },
      ],
    }),
  ]
  for (const value of invalid) {
    assert.throws(() => parseReviewResponse(value, known), value.slice(0, 60))
  }
})
