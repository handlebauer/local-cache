import { produce } from 'immer'
import { LocalFile } from '@hbauer/local-file'
import { LocalHTTPCache } from '../LocalHTTPCache.js'
import { LocalHTTPCacheError } from '../errors/LocalHTTPCacheError.js'

/**
 * @typedef {import('../parameters/metadata.js').LocalHTTPCacheMetadata} LocalHTTPCacheMetadata
 * @typedef {import('../parameters/metadata.js').LocalHTTPCacheOperationType} LocalHTTPCacheOperationType
 */

/**
 * @param {LocalHTTPCacheOperationType} type
 * @param {LocalHTTPCacheMetadata} data
 * @param {LocalFile<any>} current
 * @param {LocalFile<any>} [previous]
 */
const produceChanges = (type, data, current, previous = null) => {
  const now = Date.now()

  /**
   * File was read from cache
   */

  if (type === 'read') {
    return produce(data, draft => {
      draft.updatedAt = now
      draft.ops.reads += 1
    })
  }

  if (type === 'delete') {
    return produce(data, draft => {
      draft.updatedAt = now
      draft.ops.deletes += 1
      draft.files.count -= 1
      draft.files.size -= previous.size
    })
  }

  /**
   * New file was written to cache
   */

  if (previous === null) {
    return produce(data, draft => {
      draft.updatedAt = now
      draft.ops.writes += 1
      draft.files.count += 1
      draft.files.size += current.size
    })
  }

  /**
   * File in cache was updated
   */

  return produce(data, draft => {
    draft.updatedAt = now
    draft.ops.writes += 1
    draft.files.size += current.size - previous.size
  })
}

/**
 * @private
 *
 * @template {LocalHTTPCacheOperationType} T
 *
 * @this {LocalHTTPCache}
 * @param {T} type
 * @param {T extends 'write' ? LocalFile<any> : null} current
 * @param {T extends 'write' | 'delete' ? LocalFile<any> : null} [previous]
 */
export async function setMeta(type, current, previous) {
  const { fullPath } = this.getPaths(LocalHTTPCache.metafile)

  /**
   * Get current meta file
   */
  let meta = await LocalFile.read(fullPath, JSON.parse)

  /**
   * Produce changes to meta file data
   */
  const changes = produceChanges(type, meta.data, current, previous)

  try {
    /**
     * Update  meta file to reflect changes
     */
    meta = await LocalFile.save(fullPath, changes, JSON.stringify)
    return meta
  } catch (error) {
    throw new LocalHTTPCacheError('meta', {
      message: 'failed to update metadata',
      parent: error,
    })
  }
}
