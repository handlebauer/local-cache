import { readFile } from 'fs/promises'
import { LocalHTTPCache } from '../LocalHTTPCache.js'

/**
 * @typedef {import('../parameters/metadata.js').LocalHTTPCacheMetadata} LocalHTTPCacheMetadata
 */

/**
 * @public
 * @this {LocalHTTPCache}
 * @returns {Promise<LocalHTTPCacheMetadata>}
 */
export function getMeta() {
  const { fullPath } = this.getPaths(LocalHTTPCache.metafile)
  return readFile(fullPath, 'utf-8').then(JSON.parse)
}
