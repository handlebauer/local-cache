import _test from 'ava'
import { readFile, rm } from 'fs/promises'
import { LocalFile } from '@hbauer/local-file'
import { sleep } from '@hbauer/convenience-functions'
import { throwUnlessENOENT } from '@hbauer/local-file/errors.js'
import { LocalHTTPCache } from '../LocalHTTPCache.js'

const test = _test.serial // run all tests serially, as creating/removing files is hard to reason about otherwise

const rootDirectory = '__cache'
const baseURL = 'https://httpbin.org'
const href = baseURL + '/' + 'resource'

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

test.before('all', async _ => {
  await rm(rootDirectory, { recursive: true }).catch(throwUnlessENOENT)

  await sleep(10)
})

test.afterEach('test', async _ => {
  await rm(rootDirectory, { recursive: true }).catch(throwUnlessENOENT)

  await sleep(10)
})

test('Should return a valid LocalFile instance', async t => {
  const cache = await LocalHTTPCache.create(baseURL, json.contentType)

  const file = await cache.set(href, json.data)

  t.true(file instanceof LocalFile)
  t.false(file.attributes.fromCache)
})

test('Should write JSON data to filesystem', async t => {
  const cache = await LocalHTTPCache.create(baseURL, json.contentType)

  const file = await cache.set(href, json.data)
  const data = await readFile(file.path, 'utf-8').then(JSON.parse)

  t.deepEqual(json.data, data)
})

test('Should write HTML data to filesystem', async t => {
  const cache = await LocalHTTPCache.create(baseURL, html.contentType)

  const file = await cache.set(href, html.data)
  const data = await readFile(file.path, 'utf-8')

  // @ts-ignore
  t.is(html.data, data)
})

test('Should encode data using optional encode param if specified', async t => {
  const cache = await LocalHTTPCache.create(baseURL, html.contentType) // html contentType, defaults to the html => html encode fn

  // @ts-ignore
  await t.throwsAsync(() => cache.set(href, json.data)) // should error because we're using an object instead of a string
  await t.notThrowsAsync(() => cache.set(href, json.data, JSON.stringify)) // should succeed because encode function is compatible
})
