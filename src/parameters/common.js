import { z } from 'zod'
import { removeSlashes } from '@hbauer/convenience-functions'
import { fileAgeDuration } from '@hbauer/local-file/parameters.js'

/**
 * @typedef {z.infer<typeof baseURL>} LocalHTTPCacheBaseURL
 * @typedef {z.infer<typeof contentType>} LocalHTTPCacheContentType
 * @typedef {z.infer<typeof href>} LocalHTTPCacheHref
 * @typedef {z.infer<typeof options>} LocalHTTPCacheOptions
 */

export const baseURL = z.string().url().transform(removeSlashes)

export const contentType = z.enum(['json', 'html'])

export const rootDirectory = z
  .string()
  .optional()
  .transform(removeSlashes)
  .default('__cache')

export const name = z
  .string()
  .optional()
  .transform(string =>
    string ? string.split(' ').join('-').toLowerCase() : undefined
  )

export const fileExtension = z
  .string()
  .regex(/[a-zA-Z]+/)
  .toLowerCase()
  .optional()

export const options = z
  .object({
    rootDirectory,
    name,
    fileExtension,
  })
  .default({})

export const href = z.string().nonempty().transform(removeSlashes)

export const getOptions = z
  .object({ expiredAfter: fileAgeDuration.nullable().optional().default(null) })
  .default({ expiredAfter: null })
