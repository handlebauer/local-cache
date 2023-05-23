import { LocalFile } from '@hbauer/local-file'
import { throwUnlessENOENT } from '@hbauer/local-file/errors.js'
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

  /**
   * Read the file from the local file-system. If the file is found,
   * mark it down as a read; if the file isn't found, return null; if
   * there is a problem unrelated to whether the file exists or not,
   * throw an error.
   */
  const file = await LocalFile.read(fullPath, this.decode)
    .then(async file => (await this.setMeta('read', null), file))
    .catch(throwUnlessENOENT)

  if (file && expiredAfter !== null) {
    const isExpired = await file.olderThan(expiredAfter)
    if (isExpired) file.expire()
  }

  return file
}
