# @hbauer/local-cache

## Install

```sh
$ yarn add @hbauer/local-cache
$ npm install @hbauer/local-cache
```

## Usage

```js
import { LocalHTTPCache } from '@hbauer/local-cache'

const rootDirectory = '__cache' // writes to $PROJECT_ROOT/__cache/...
const name = 'movies' // writes to $PROJECT_ROOT/__cache/movies/...

const cache = new LocalHTTPCache('https://imdb.com', 'html', {
  rootDirectory,
  name,
})

const href = `${baseURL}/title/${movieId}` // i.e. https://imdb.com/title/...'
const data = await fetch(href).then(response => response.text())
const file = await cache.set(href, data)

assert.equal(file instanceof LocalFile === true)
assert.equal(file.filename, movieId)
assert.deepEqual(file.data, data)
assert.deepEqual(file.data, await cache.get(href))

const { filename, fullPath } = cache.getPaths(href)

assert.equal(file.filename, filename)
assert.equal(file.path.endsWith(fullPath) === true)

// TODO: finish readme
```
