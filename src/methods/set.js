import { LocalFile } from '@hbauer/local-file'
import { throwUnlessENOENT } from '@hbauer/local-file/errors.js'
import { LocalHTTPCache } from '../LocalHTTPCache.js'

/**
 * @typedef {import('../parameters/common.js').LocalHTTPCacheHref} LocalHTTPCacheHref
 */

/**
 * @this {LocalHTTPCache}
 * @param {string} fullPath
 * @param {any} data
 */
export async function overwrite(fullPath, data) {
  const current = await LocalFile.save(fullPath, data, this.encode)
  current.attributes.cached = true
  return current
}

/**
 * @this {LocalHTTPCache}
 * @param {LocalHTTPCacheHref} href
 * @param {any} data
 */
export async function set(href, data) {
  const { fullPath } = this.getPaths(href)

  /**
   * A read is executed for the derived path in case the file already
   * exists. In this case, the file will be overwritten, which has
   * bearing on the meta file count (which will be incremented by one if
   * the file doesn't yet exist, or remain the same if the operation
   * results in an overwite).
   */

  // prettier-ignore
  const previous = await LocalFile.read(fullPath, this.decode).catch(throwUnlessENOENT)
  const current = await LocalFile.save(fullPath, data, this.encode)

  await this.setMeta('write', current, previous)

  current.attributes.cached = !!previous

  return current
}
