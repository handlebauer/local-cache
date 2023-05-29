import { LocalFile } from '@hbauer/local-file'
import { throwUnlessENOENT } from '@hbauer/local-file/errors.js'
import { LocalHTTPCache } from '../LocalHTTPCache.js'
import * as validate from '../parameters/common.js'

/**
 * @typedef {import('../parameters/common.js').LocalHTTPCacheHref} LocalHTTPCacheHref
 * @typedef {Parameters<LocalFile<any>['olderThan']>['0']} LocalHTTPCacheExpiresAfter
 */

/**
 * @public
 * @this {LocalHTTPCache}
 * @param {LocalHTTPCacheHref} href
 * @param {{ expiredAfter?: LocalHTTPCacheExpiresAfter, decode?: (data: string) => any }} [options]
 */
export async function get(href, options) {
  options = validate.getOptions.parse(options)

  const { fullPath } = this.getPaths(href)

  /**
   * Read the file from the local file-system. If the file is found,
   * mark it down as a read; if the file isn't found, return null; if
   * there is a problem unrelated to whether the file exists or not,
   * throw an error.
   */
  const file = await LocalFile.read(fullPath, options.decode || this.decode)
    .then(async file => (await this.setMeta('read', null), file))
    .catch(throwUnlessENOENT)

  if (file !== null) {
    file.attributes.fromCache = true
    file.attributes.expired = false

    if (options.expiredAfter !== null) {
      const isExpired = await file.olderThan(options.expiredAfter)
      if (isExpired) file.attributes.expired = true
    }
  }

  return file
}
