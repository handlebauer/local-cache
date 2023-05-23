import _test from 'ava'
import { LocalHTTPCache } from './LocalHTTPCache.js'

const test = _test.serial // run all tests serially, as creating/removing files is hard to reason about otherwise

const rootDirectory = '__cache'
const baseURL = 'https://httpbin.org'
const name = 'httpbin'

const json = /** @type {const} */ ({
  data: { foo: 'bar' },
  contentType: 'json',
  fileExtension: 'json',
})

test('Should return a valid instance with all optional parameters omitted', t => {
  const cache = new LocalHTTPCache(baseURL, json.contentType)

  t.true(cache instanceof LocalHTTPCache)
  t.is(cache.rootDirectory, rootDirectory)
  t.is(cache.contentType, json.contentType)
  t.is(cache.baseURL, baseURL)
  t.is(cache.name, new URL(baseURL).host)
})

test('Should return a valid instance with all options configured', t => {
  const options = { rootDirectory, name, fileExtension: json.fileExtension }
  const cache = new LocalHTTPCache(baseURL, json.contentType, options)

  t.true(cache instanceof LocalHTTPCache)
  t.is(cache.rootDirectory, rootDirectory)
  t.is(cache.contentType, json.contentType)
  t.is(cache.baseURL, baseURL)
  t.is(cache.name, name)
  t.is(cache.fileExtension, json.fileExtension)
})

test('Should return the correct encoding/decoding functions given the provided contentType', t => {
  const jsonCache = new LocalHTTPCache(baseURL, 'json')

  t.is(jsonCache.encode, JSON.stringify)
  t.is(jsonCache.decode, JSON.parse)

  const htmlCache = new LocalHTTPCache(baseURL, 'html')

  const passThrough = '(/** @type {string} */ html) => html'

  t.is(htmlCache.encode.toString(), passThrough)
  t.is(htmlCache.decode.toString(), passThrough)
})
