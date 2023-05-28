import _test from 'ava'
import { rm } from 'fs/promises'
import { LocalFile } from '@hbauer/local-file'
import { sleep } from '@hbauer/convenience-functions'
import { LocalFileError, throwUnlessENOENT } from '@hbauer/local-file/errors.js'
import { LocalHTTPCache } from '../LocalHTTPCache.js'

const test = _test.serial // run all tests serially, as creating/removing files is hard to reason about otherwise

/**
 *
 * MOCK DATA
 *
 */

const rootDirectory = '__cache'
const baseURL = 'https://httpbin.org'
const name = new URL(baseURL).host
const href = baseURL + '/' + 'resource'
const path = rootDirectory + '/' + name + '/' + 'resource'

const json = /** @type {const} */ ({
  data: { foo: 'bar' },
  contentType: 'json',
  fileExtension: 'json',
})

const html = /** @type {const} */ ({
  data: '<html><head><title>test</title></head><body>test body</body></html>',
  contentType: 'html',
  fileExtension: 'html',
})

/**
 *
 * HANDLERS
 *
 */

test.afterEach('test', async _ => {
  await rm(rootDirectory, { recursive: true }).catch(throwUnlessENOENT)

  await sleep(10)
})

test("Should return null for for a file that doesn't exist", async t => {
  const cache = await LocalHTTPCache.create(baseURL, html.contentType)

  const file = await cache.get(href)

  t.is(file, null)
})

test('Should return a valid LocalFile instance for a file that exists', async t => {
  const cache = await LocalHTTPCache.create(baseURL, html.contentType)

  await cache.set(href, html.data)

  const file = await cache.get(href)

  t.true(file instanceof LocalFile)
  t.true(file.attributes.fromCache)
  t.false(file.attributes.expired)
  t.is(file.path, cache.getPaths(href).fullPath)
})

test('Should return a valid LocalFile instance whether provided a relative or absolute href', async t => {
  const cache = await LocalHTTPCache.create(baseURL, html.contentType)

  const relativeHref = 'resource'
  await cache.set(relativeHref, html.data)
  const relative = await cache.get(relativeHref)

  const absoluteHref = baseURL + '/' + 'resource'
  await cache.set(absoluteHref, html.data)
  const absolute = await cache.get(absoluteHref)

  t.true(relative instanceof LocalFile)
  t.true(absolute instanceof LocalFile)

  t.is(relative.path, path)
  t.is(relative.path, cache.getPaths(relativeHref).fullPath)
  t.is(relative.path, cache.getPaths(absoluteHref).fullPath)

  t.is(absolute.path, path)
  t.is(absolute.path, cache.getPaths(absoluteHref).fullPath)
  t.is(absolute.path, cache.getPaths(relativeHref).fullPath)

  t.is(relative.path, absolute.path)
})

test('Should return a LocalFile instance with the `expired` attribute set to true if the file is older than the provided value', async t => {
  const cache = await LocalHTTPCache.create(baseURL, html.contentType)

  await cache.set(href, html.data)

  const file = await cache.get(href, { expiredAfter: [0, 'milliseconds'] })

  t.true(file instanceof LocalFile)
  t.is(file.path, path)
  t.is(file.path, cache.getPaths(href).fullPath)
  t.is(file.attributes.expired, true)
})

test('Should throw an error if the value passed in for `expiredAfter` is invalid', async t => {
  const cache = await LocalHTTPCache.create(baseURL, html.contentType)

  await cache.set(href, html.data)

  await t.throwsAsync(() =>
    // @ts-ignore
    cache.get(href, { expiredAfter: [0, 'millisecds'] })
  )
})

test('Should execute without problems if the method options passed in are nullish or omitted', async t => {
  const cache = await LocalHTTPCache.create(baseURL, html.contentType)

  await cache.set(href, html.data)

  await t.notThrowsAsync(() => cache.get(href, { expiredAfter: undefined }))
  await t.notThrowsAsync(() => cache.get(href, { expiredAfter: null }))
  await t.notThrowsAsync(() => cache.get(href))
})

test('Should decode data using optional decode param if specified', async t => {
  const cache = await LocalHTTPCache.create(baseURL, html.contentType) // html contentType, defaults to the html => html decode fn

  await cache.set(href, json.data, JSON.stringify) // save some json data

  let file = await cache.get(href)
  t.is(typeof file.data, 'string')

  file = await cache.get(href, { decode: JSON.parse })
  t.is(typeof file.data, 'object')
})
