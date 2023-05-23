import _test from 'ava'
import { readFile, rm } from 'fs/promises'
import { sleep } from '@hbauer/convenience-functions'
import { throwUnlessENOENT } from '@hbauer/local-file/errors.js'
import { randomString } from 'remeda'
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
const path = rootDirectory + '/' + name + '/' + LocalHTTPCache.metafile

const html = /** @type {const} */ ({
  data: '<html><head><title>test</title></head><body>test body</body></html>',
  contentType: 'html',
  fileExtension: 'json',
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

test('Should return accurate/valid metadata after initializing cache', async t => {
  const cache = await LocalHTTPCache.create(baseURL, html.contentType)

  const actual = await readFile(path, 'utf-8').then(JSON.parse)

  const meta = await cache.getMeta()

  t.deepEqual(meta, actual)
})

test('Should return accurate/valid metadata after executing write operations', async t => {
  const cache = await LocalHTTPCache.create(baseURL, html.contentType)

  const size = 50
  const num = 3

  await cache.set(randomString(10), randomString(size))
  await cache.set(randomString(10), randomString(size))
  await cache.set(randomString(10), randomString(size))

  const actual = await readFile(path, 'utf-8').then(JSON.parse)

  const meta = await cache.getMeta()

  t.deepEqual(meta, actual)
  t.is(meta.files.count, num)
  t.is(meta.files.size, size * num)
  t.is(meta.ops.reads, 0)
  t.is(meta.ops.writes, num)
})

test('Should return accurate/valid metadata after executing a read operation', async t => {
  const cache = await LocalHTTPCache.create(baseURL, html.contentType)

  const size = 50
  const num = 3

  const href = 'test'

  await cache.set(href, randomString(size))

  await cache.get(href)
  await cache.get(href)
  await cache.get(href)

  const actual = await readFile(path, 'utf-8').then(JSON.parse)

  const meta = await cache.getMeta()

  t.deepEqual(meta, actual)
  t.is(meta.ops.reads, num)
})
