import _test from 'ava'
import { readFile, rm } from 'fs/promises'
import { sleep, typeOf } from '@hbauer/convenience-functions'
import { throwUnlessENOENT } from '@hbauer/local-file/errors.js'
import { LocalHTTPCache } from '../LocalHTTPCache.js'

const test = _test.serial // run all tests serially, as creating/removing files is hard to reason about otherwise

/**
 *
 * MOCK DATA
 *
 */

const rootDirectory = '__cache'
const baseURL = 'https://httpbin.org'

/**
 *
 * HANDLERS
 *
 */

test.afterEach('test', async _ => {
  await rm(rootDirectory, { recursive: true }).catch(throwUnlessENOENT)

  await sleep(10)
})

test('Should successfully initialize a metadata file', async t => {
  const cache = new LocalHTTPCache(baseURL, 'html', {
    rootDirectory,
  })

  await cache.createMeta()

  const { fullPath } = cache.getPaths(LocalHTTPCache.metafile)

  const actual = await readFile(fullPath, 'utf-8').then(JSON.parse)

  t.is(typeOf(actual.createdAt), 'number')
  t.is(typeOf(actual.updatedAt), 'number')
  t.is(typeOf(new Date(actual.createdAt)), 'date')
  t.is(typeOf(new Date(actual.updatedAt)), 'date')
  t.is(isNaN(Number(new Date(actual.createdAt))), false) // isNaN is true if `Invalid Date` ❌
  t.is(isNaN(Number(new Date(actual.updatedAt))), false) // isNaN is true if `Invalid Date` ❌

  t.is(actual.files.count, 0)
  t.is(actual.files.size, 0)
  t.is(actual.ops.reads, 0)
  t.is(actual.ops.writes, 0)
})
