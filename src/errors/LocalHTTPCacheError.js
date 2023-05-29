import { ZodError } from 'zod'
import { formatZodError } from './format/format-zod-error.js'

/**
 * @typedef {(Error & NodeJS.ErrnoException | ZodError) & { status?: number, code?: string }} ParentError
 */

export class LocalHTTPCacheError extends Error {
  /**
   * @typedef {{
   * message?: string
   * parent?: ParentError
   * formatParent?: (error: Error & NodeJS.ErrnoException) => string
   * status?: number
   * code?: string
   * }} LocalHTTPCacheErrorParams
   */

  /**
   * @param {string} title
   * @param {LocalHTTPCacheErrorParams} params
   */
  constructor(title, { message, parent, formatParent, status, code } = {}) {
    super()

    if (title) {
      this.message = title
    }

    if (message) {
      if (title) {
        this.message += ':' + ' ' + message
      } else {
        this.message = message
      }
    }

    if (parent) {
      if (parent instanceof ZodError) {
        this.message += formatZodError(parent)
      } else if (formatParent) {
        this.message += ' ' + '[' + formatParent(parent) + ']'
      } else {
        this.message += ' ' + '[' + parent.message + ']'
      }
    }

    if (status || parent?.status) {
      this.status = status || parent.status
    }

    if (code || parent?.code) {
      this.code = code || parent?.code
    }
  }
}
