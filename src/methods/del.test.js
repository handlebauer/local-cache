import _test from 'ava'
import { readFile, rm } from 'fs/promises'
import { LocalFile } from '@hbauer/local-file'
import { sleep } from '@hbauer/convenience-functions'
import { throwUnlessENOENT } from '@hbauer/local-file/errors.js'
import { randomString } from 'remeda'
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

test.beforeEach('test', async _ => {
  await rm(rootDirectory, { recursive: true }).catch(throwUnlessENOENT)

  await sleep(10)
})

test.afterEach('test', async _ => {
  await rm(rootDirectory, { recursive: true }).catch(throwUnlessENOENT)

  await sleep(10)
})

test('Should throw an error if the provided path is empty or of an incompatible type', async t => {
  const cache = await LocalHTTPCache.create(baseURL, json.contentType)

  await t.throwsAsync(() => cache.del(null))

  await t.throwsAsync(() => cache.del(''))

  await t.throwsAsync(
    // @ts-ignore
    () => cache.del(Symbol('not a string'))
  )
})
test('Should throw an error when attempting to remove a non-existent file', async t => {
  const cache = await LocalHTTPCache.create(baseURL, json.contentType)

  await t.throwsAsync(() => cache.del(randomString(10)))
})

test('Should remove an existing file from the local filesystem', async t => {
  const cache = await LocalHTTPCache.create(baseURL, json.contentType)

  const file = await cache.set(href, html.data)

  await t.notThrowsAsync(() => readFile(file.path, 'utf-8')) // read newly created file

  await t.notThrowsAsync(() => LocalFile.rm(file.path)) // remove newly created file

  await t.throwsAsync(() => readFile(file.path, 'utf-8'), {
    code: 'ENOENT',
  }) // read newly removed file
})
