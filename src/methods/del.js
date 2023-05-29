import { LocalFile } from '@hbauer/local-file'
import { throwUnlessENOENT } from '@hbauer/local-file/errors.js'
import { LocalHTTPCache } from '../LocalHTTPCache.js'
import { LocalHTTPCacheError } from '../errors/LocalHTTPCacheError.js'

/**
 * @typedef {import('../parameters/common.js').LocalHTTPCacheHref} LocalHTTPCacheHref
 */

/**
 * @public
 * @this {LocalHTTPCache}
 * @param {LocalHTTPCacheHref} href
 * @returns {Promise<void>}
 */
export async function del(href) {
  const { fullPath } = this.getPaths(href)

  // prettier-ignore
  const previous = await LocalFile.read(fullPath, this.decode).catch(throwUnlessENOENT)

  try {
    await previous.rm()
  } catch (error) {
    throw new LocalHTTPCacheError('del', {
      message: `failed while removing data`,
      parent: error,
    })
  }

  await this.setMeta('delete', null, previous)
}
