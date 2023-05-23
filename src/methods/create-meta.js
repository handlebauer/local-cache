import { LocalFile } from '@hbauer/local-file'
import { LocalHTTPCacheError } from '../errors/LocalHTTPCacheError.js'
import { LocalHTTPCache } from '../LocalHTTPCache.js'

/**
 * @typedef {import('../parameters/common.js').LocalHTTPCacheBaseURL} LocalHTTPCacheBaseURL
 * @typedef {import('../parameters/common.js').LocalHTTPCacheContentType} LocalHTTPCacheContentType
 * @typedef {import('../parameters/common.js').LocalHTTPCacheOptions} LocalHTTPCacheOptions
 * @typedef {import('../parameters/metadata.js').LocalHTTPCacheMetadata} LocalHTTPCacheMetadata
 */

/**
 * @type {LocalHTTPCacheMetadata}
 */
const initialState = ((now = Date.now()) => {
  return {
    createdAt: now,
    updatedAt: now,
    files: { count: 0, size: 0 },
    ops: { reads: 0, writes: 0 },
  }
})()

/**
 * @public
 * @this {LocalHTTPCache}
 */
export async function createMeta() {
  const { fullPath } = this.getPaths(LocalHTTPCache.metafile)
  try {
    const returnExisting = { returnExisting: true }
    await LocalFile.save(fullPath, initialState, JSON.stringify, returnExisting)
  } catch (error) {
    throw new LocalHTTPCacheError({
      title: 'meta',
      description: "failed to create cache's meta file",
      parent: error,
    })
  }
}
