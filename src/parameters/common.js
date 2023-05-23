import { z } from 'zod'
import { removeSlashes } from '@hbauer/convenience-functions'

/**
 * @typedef {z.infer<typeof baseURL>} LocalHTTPCacheBaseURL
 * @typedef {z.infer<typeof contentType>} LocalHTTPCacheContentType
 * @typedef {z.infer<typeof href>} LocalHTTPCacheHref
 * @typedef {z.infer<typeof cacheOptions>} LocalHTTPCacheOptions
 */

export const baseURL = z.string().transform(dir => removeSlashes(dir))

export const contentType = z.enum(['json', 'html'])

export const rootDirectory = z
  .string()
  .optional()
  .transform(dir => removeSlashes(dir))

export const name = z
  .string()
  .optional()
  .transform(string =>
    string ? string.split(' ').join('-').toLowerCase() : null
  )

export const fileExtension = z
  .string()
  .regex(/[a-zA-Z]+/)
  .toLowerCase()
  .optional()

export const cacheOptions = z.object({
  rootDirectory,
  name,
  fileExtension,
})

export const href = z
  .string()
  .nonempty()
  .transform(dir => removeSlashes(dir))
