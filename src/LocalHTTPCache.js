import * as methods from './methods/index.js'
import * as validate from './parameters/common.js'
import { getHost } from './utils/get-host.js'

/**
 * @typedef {import('./parameters/common.js').LocalHTTPCacheBaseURL} LocalHTTPCacheBaseURL
 * @typedef {import('./parameters/common.js').LocalHTTPCacheContentType} LocalHTTPCacheContentType
 * @typedef {import('./parameters/common.js').LocalHTTPCacheOptions} LocalHTTPCacheOptions
 */

export class LocalHTTPCache {
  /**
   * @public
   * @readonly
   */
  static metafile = '.meta'

  /**
   * @param {LocalHTTPCacheBaseURL} baseURL
   * @param {LocalHTTPCacheContentType} contentType
   * @param {LocalHTTPCacheOptions} [options]
   */
  static async create(baseURL, contentType, options) {
    const cache = new LocalHTTPCache(baseURL, contentType, options)
    await cache.createMeta()
    return cache
  }

  /**
   * @param {LocalHTTPCacheBaseURL} baseURL
   * @param {LocalHTTPCacheContentType} contentType
   * @param {LocalHTTPCacheOptions} [options]
   */
  constructor(baseURL, contentType, options) {
    /**
     * @public
     * @readonly
     * @type {string}
     * e.g. 'https://httpbin.org'
     */
    this.baseURL = validate.baseURL.parse(baseURL)

    /**
     * @public
     * @readonly
     * @type {string}
     * e.g. 'json' or 'html'
     */
    this.contentType = validate.contentType.parse(contentType)

    /**
     *  parse options
     */
    options = validate.options.parse(options)

    /**
     * @public
     * @readonly
     * @type {LocalHTTPCacheOptions['rootDirectory']}
     * e.g. '__cache'
     */
    this.rootDirectory = options.rootDirectory

    /**
     * @public
     * @readonly
     * @type {LocalHTTPCacheOptions['name']}
     */
    this.name = options.name || getHost(this.baseURL)

    /**
     * @public
     * @readonly
     * @type {LocalHTTPCacheOptions['fileExtension']}
     */
    this.fileExtension = options.fileExtension || null

    /**
     * @function
     * @readonly
     * @public
     */
    this.encode =
      this.contentType === 'json'
        ? JSON.stringify
        : (/** @type {string} */ html) => html

    /**
     * @function
     * @readonly
     * @public
     */
    this.decode =
      this.contentType === 'json'
        ? JSON.parse
        : (/** @type {string} */ html) => html
  }
}

/**
 * @typedef {import('./parameters/common.js').LocalHTTPCacheHref} LocalHTTPCacheHref
 */

/**
 * @public
 * @param {LocalHTTPCache} href
 */
LocalHTTPCache.prototype.getPaths = methods.getPaths

/**
 * @public
 * @this {LocalHTTPCache}
 * @param {string} href
 */
LocalHTTPCache.prototype.get = methods.get

/**
 * @public
 * @this {LocalHTTPCache}
 * @param {LocalHTTPCacheHref} href
 * @param {any} data
 */
LocalHTTPCache.prototype.set = methods.set

/**
 * @public
 * @this {LocalHTTPCache}
 */
LocalHTTPCache.prototype.createMeta = methods.createMeta

/**
 * @public
 * @this {LocalHTTPCache}
 */
LocalHTTPCache.prototype.getMeta = methods.getMeta

/**
 * @public
 * @this {LocalHTTPCache}
 */
LocalHTTPCache.prototype.setMeta = methods.setMeta
