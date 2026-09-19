export const RISKS = ['Low', 'Medium', 'High', 'Critical'] as const
export const AUTHORIZATIONS = ['High', 'Medium', 'Low', 'Unknown'] as const

export type Risk = (typeof RISKS)[number]
export type Authorization = (typeof AUTHORIZATIONS)[number]

export type EvidenceRequest = {
  operation: 'stat' | 'list' | 'read'
  path: string
}

export type NeedEvidence = {
  type: 'need_evidence'
  requests: EvidenceRequest[]
}

export type Assessment = {
  type: 'assessment'
  risk: Risk
  authorization: Authorization
  narrowlyScoped: boolean
  planCompatible: boolean
  explicitProhibition: boolean
  maliciousUntrustedInstruction: boolean
  decisionCriticalUncertainty: boolean
  reason: string
  evidenceIds: string[]
}

export type ReviewResponse = NeedEvidence | Assessment
export type PolicyDecision = { allow: boolean; reason: string }

const ASSESSMENT_KEYS = [
  'authorization',
  'decisionCriticalUncertainty',
  'evidenceIds',
  'explicitProhibition',
  'maliciousUntrustedInstruction',
  'narrowlyScoped',
  'planCompatible',
  'reason',
  'risk',
  'type',
] as const
const EVIDENCE_KEYS = ['requests', 'type'] as const
const REQUEST_KEYS = ['operation', 'path'] as const

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const hasExactKeys = (value: Record<string, unknown>, keys: readonly string[]) =>
  Object.keys(value).sort().join('\0') === [...keys].sort().join('\0')

const isEnum = <T extends string>(value: unknown, values: readonly T[]): value is T =>
  typeof value === 'string' && values.includes(value as T)

export function parseReviewResponse(
  text: string,
  knownEvidenceIds: ReadonlySet<string>,
): ReviewResponse {
  if (text.length > 16_384) throw new Error('review output is too large')
  const trimmed = text.trim()
  const candidate =
    trimmed.startsWith('```json\n') && trimmed.endsWith('\n```')
      ? trimmed.slice(8, -4).trim()
      : trimmed

  let value: unknown
  try {
    value = JSON.parse(candidate)
  } catch {
    throw new Error('review output is not JSON')
  }
  if (!isRecord(value) || typeof value.type !== 'string') {
    throw new Error('review output is not an object variant')
  }

  if (value.type === 'need_evidence') {
    if (!hasExactKeys(value, EVIDENCE_KEYS) || !Array.isArray(value.requests)) {
      throw new Error('invalid evidence request shape')
    }
    if (value.requests.length < 1 || value.requests.length > 4) {
      throw new Error('evidence request count is outside the limit')
    }
    const seen = new Set<string>()
    const requests = value.requests.map(request => {
      if (!isRecord(request) || !hasExactKeys(request, REQUEST_KEYS)) {
        throw new Error('invalid evidence request')
      }
      if (!isEnum(request.operation, ['stat', 'list', 'read'] as const)) {
        throw new Error('invalid evidence operation')
      }
      if (
        typeof request.path !== 'string' ||
        request.path.length < 1 ||
        request.path.length > 4_096 ||
        seen.has(request.path)
      ) {
        throw new Error('invalid or duplicate evidence path')
      }
      seen.add(request.path)
      return { operation: request.operation, path: request.path }
    })
    return { type: 'need_evidence', requests }
  }

  if (value.type !== 'assessment' || !hasExactKeys(value, ASSESSMENT_KEYS)) {
    throw new Error('invalid assessment shape')
  }
  if (!isEnum(value.risk, RISKS) || !isEnum(value.authorization, AUTHORIZATIONS)) {
    throw new Error('invalid assessment enum')
  }
  for (const key of [
    'narrowlyScoped',
    'planCompatible',
    'explicitProhibition',
    'maliciousUntrustedInstruction',
    'decisionCriticalUncertainty',
  ] as const) {
    if (typeof value[key] !== 'boolean') throw new Error(`invalid ${key}`)
  }
  if (
    typeof value.reason !== 'string' ||
    value.reason.trim().length < 1 ||
    value.reason.length > 500
  ) {
    throw new Error('invalid assessment reason')
  }
  if (
    !Array.isArray(value.evidenceIds) ||
    value.evidenceIds.length > 32 ||
    value.evidenceIds.some(id => typeof id !== 'string' || !knownEvidenceIds.has(id)) ||
    new Set(value.evidenceIds).size !== value.evidenceIds.length
  ) {
    throw new Error('invalid assessment evidence ids')
  }

  return value as Assessment
}

export function applyPolicy(assessment: Assessment): PolicyDecision {
  if (
    assessment.explicitProhibition ||
    assessment.maliciousUntrustedInstruction ||
    assessment.decisionCriticalUncertainty ||
    assessment.risk === 'Critical'
  ) {
    return { allow: false, reason: assessment.reason }
  }
  if (assessment.risk === 'High') {
    const authorized =
      assessment.authorization === 'High' || assessment.authorization === 'Medium'
    return {
      allow: authorized && assessment.narrowlyScoped,
      reason: assessment.reason,
    }
  }
  return { allow: true, reason: assessment.reason }
}
