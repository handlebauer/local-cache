import { z } from 'zod'

/**
 * @typedef {z.infer<typeof operationType>} LocalHTTPCacheOperationType
 * @typedef {z.infer<typeof metadata>} LocalHTTPCacheMetadata
 */

export const operationType = z.enum(['read', 'write', 'delete'])
export const createdAt = z.number().gte(0)
export const updatedAt = z.number().gte(0)
export const count = z.number().gte(0)
export const size = z.number().gte(0)
export const reads = z.number().gte(0)
export const writes = z.number().gte(0)
export const deletes = z.number().gte(0)

export const metadata = z.object({
  createdAt,
  updatedAt,
  files: z.object({ count, size }),
  ops: z.object({ reads, writes, deletes }),
})
