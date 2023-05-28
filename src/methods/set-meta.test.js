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
  fileExtension: 'html',
})

/**
 *
 * HANDLERS
 *
 */

test.before('test', async _ => {
  await rm(rootDirectory, { recursive: true }).catch(throwUnlessENOENT)

  await sleep(10)
})

test.afterEach('test', async _ => {
  await rm(rootDirectory, { recursive: true }).catch(throwUnlessENOENT)

  await sleep(10)
})

test("Should update metadata's read ops if `read` is provided as the type", async t => {
  const cache = await LocalHTTPCache.create(baseURL, html.contentType)

  await cache.setMeta('read', null)
  const meta = await cache.getMeta()

  const actual = await readFile(path, 'utf-8').then(JSON.parse)

  t.deepEqual(meta, actual)
  t.is(meta.ops.reads, 1)
})

test("Should update metadata's write ops if `write` is provided as the type", async t => {
  const cache = await LocalHTTPCache.create(baseURL, html.contentType)

  const file = await cache.set(randomString(10), randomString(50))

  await cache.setMeta('write', file)
  const meta = await cache.getMeta()

  const actual = await readFile(path, 'utf-8').then(JSON.parse)

  t.deepEqual(meta, actual)
  t.is(meta.ops.writes, 2) // cache.set will increment the writes by 1 already, so 1 + 1
})

test('Should correctly update the cache size if a file is updated/modified', async t => {
  const cache = await LocalHTTPCache.create(baseURL, html.contentType)

  const href = 'test'
  let size = 50

  await cache.set(href, randomString(size))
  let meta = await cache.getMeta()

  t.is(meta.files.size, size)
  t.is(meta.ops.writes, 1)

  size = 100

  await cache.set(href, randomString(size))
  meta = await cache.getMeta()

  t.is(meta.ops.writes, 2)
  t.is(meta.files.size, 100)
})
