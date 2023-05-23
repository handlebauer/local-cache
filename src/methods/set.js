import { LocalFile } from '@hbauer/local-file'
import { throwUnlessENOENT } from '@hbauer/local-file/errors.js'
import { LocalHTTPCache } from '../LocalHTTPCache.js'

/**
 * @typedef {import('../parameters/common.js').LocalHTTPCacheHref} LocalHTTPCacheHref
 */

/**
 * @this {LocalHTTPCache}
 * @param {LocalHTTPCacheHref} href
 * @param {any} data
 */
export async function set(href, data) {
  const { fullPath } = this.getPaths(href)

  // prettier-ignore
  const previous = await LocalFile.read(fullPath, this.decode).catch(throwUnlessENOENT)
  const current = await LocalFile.save(fullPath, data, this.encode)

  await this.setMeta('write', current, previous)

  return current
}
