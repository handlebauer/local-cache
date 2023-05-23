import { LocalFile } from '@hbauer/local-file'
import { LocalHTTPCache } from '../LocalHTTPCache.js'

/**
 * @typedef {import('../parameters/common.js').LocalHTTPCacheHref} LocalHTTPCacheHref
 * @typedef {Parameters<LocalFile['olderThan']>['0']} LocalHTTPCacheExpiresAfter
 */

/**
 *
 * @this {LocalHTTPCache}
 * @param {LocalHTTPCacheHref} href
 * @param {{ expiredAfter: LocalHTTPCacheExpiresAfter }} [options]
 */
export async function get(href, { expiredAfter } = { expiredAfter: null }) {
  const { fullPath } = this.getPaths(href)

  const [file] = await Promise.all([
    LocalFile.read(fullPath, this.decode),
    this.setMeta('read', null),
  ])

  if (expiredAfter !== null) {
    const isExpired = await file.olderThan(expiredAfter)
    if (isExpired) file.expire()
  }

  return file
}
