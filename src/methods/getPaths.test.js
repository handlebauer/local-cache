import _test from 'ava'
import { ZodError } from 'zod'
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

const json = /** @type {const} */ ({
  data: { foo: 'bar' },
  contentType: 'json',
  fileExtension: 'json',
})

test('Should return an error if the provided ref is an empty string or of an incompaatible type', async t => {
  const cache = await LocalHTTPCache.create(baseURL, json.contentType, {
    rootDirectory,
    name,
  })

  t.throws(() => cache.getPaths(''), { instanceOf: ZodError })
  t.throws(() => cache.getPaths(null), { instanceOf: ZodError })
  t.throws(() => cache.getPaths(undefined), { instanceOf: ZodError })

  // @ts-ignore
  t.throws(() => cache.getPaths(Symbol('not a string')))
})

test('Should return valid paths', async t => {
  const cache = await LocalHTTPCache.create(baseURL, json.contentType, {
    rootDirectory,
    name,
  })

  const href = baseURL + '/' + 'path/to/resource'

  const { directory, filename, fullPath } = cache.getPaths(href)

  const expected = {
    directory: rootDirectory + '/' + name + '/' + 'path/to',
    filename: 'resource',
    path: rootDirectory + '/' + name + '/' + 'path/to' + '/' + filename,
  }

  t.is(directory, expected.directory)
  t.is(filename, expected.filename)
  t.is(fullPath, expected.path)
})

test('Should return valid paths when a file extension is configured', async t => {
  const cache = await LocalHTTPCache.create(baseURL, json.contentType, {
    rootDirectory,
    name,
    fileExtension: json.fileExtension,
  })

  const href = baseURL + '/' + 'path/to/resource'

  const { directory, filename, fullPath } = cache.getPaths(href)

  const expected = {
    directory: rootDirectory + '/' + name + '/' + 'path/to',
    filename: 'resource.json',
    path: rootDirectory + '/' + name + '/' + 'path/to' + '/' + filename,
  }

  t.is(directory, expected.directory)
  t.is(filename, expected.filename)
  t.is(fullPath, expected.path)
})

test('Should return valid paths given a top-level resource', async t => {
  const cache = await LocalHTTPCache.create(baseURL, json.contentType, {
    rootDirectory,
    name,
  })

  const href = baseURL + '/' + 'resource'

  const { directory, filename, fullPath } = cache.getPaths(href)

  const expected = {
    directory: rootDirectory + '/' + name,
    filename: 'resource',
    path: rootDirectory + '/' + name + '/' + filename,
  }

  t.is(directory, expected.directory)
  t.is(filename, expected.filename)
  t.is(fullPath, expected.path)
})

test('Should return valid paths given an atypical href', async t => {
  const cache = await LocalHTTPCache.create(baseURL, json.contentType, {
    rootDirectory,
    name,
  })

  const href = '///' + baseURL + '/' + 'resource' + '///'

  const { directory, filename, fullPath } = cache.getPaths(href)

  const expected = {
    directory: rootDirectory + '/' + name,
    filename: 'resource',
    path: rootDirectory + '/' + name + '/' + filename,
  }

  t.is(directory, expected.directory)
  t.is(filename, expected.filename)
  t.is(fullPath, expected.path)
})
