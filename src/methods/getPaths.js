import { removeSlashes } from '@hbauer/convenience-functions'
import { last, pipe } from 'remeda'
import { LocalHTTPCache } from '../LocalHTTPCache.js'
import * as validate from '../parameters/common.js'

/**
 * @typedef {import('../parameters/common.js').LocalHTTPCacheHref} LocalHTTPCacheHref
 */

/**
 * @public
 * @this {LocalHTTPCache}
 * @param {LocalHTTPCacheHref} href
 */
export function getPaths(href) {
  href = validate.href.parse(href)

  /**
   * If href is 'https://httpbin.org/path/to/page', then intermediatePath is 'path/to/page'
   */
  let intermediatePath = href.startsWith(this.baseURL)
    ? pipe(href.split(this.baseURL), last(), removeSlashes)
    : href

  /**
   * If intermediatePath was 'path/to/page', now it's 'path/to/page.ext'
   */
  if (!!this.fileExtension === true) {
    intermediatePath += '.' + this.fileExtension
  }

  let directory = this.rootDirectory

  /**
   * If directory was '__cache', now it's '__cache/cache-name'
   */
  if (!!this.name === true) {
    directory += '/' + this.name
  }

  /**
   * If intermediatePath is 'path/to/page', then pathParts is ['path', 'to', 'page']
   */
  const pathParts = intermediatePath.split('/')

  /**
   * If directory was '__cache' and pathParts is ['path', 'to', page'], then directory is '__cache/path/to'
   */
  if (pathParts.length > 1) {
    directory += '/' + pathParts.slice(0, -1).join('/')
  }

  /**
   * If intermediatePath is 'path/to/page', then filename is 'page'
   */
  const filename = intermediatePath.split('/').at(-1)

  /**
   * If drectory is '__cache/path/to' and filename is 'page', then fullPath is '__cache/path/to/page'
   */
  const fullPath = directory + '/' + filename

  return { directory, filename, fullPath }
}
