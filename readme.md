# synchronous-autocomplete

**Fast, simple [autocompletion](https://en.wikipedia.org/wiki/Autocomplete).** Also supports [Levenshtein](https://en.wikipedia.org/wiki/Levenshtein_distance)-based fuzzy search. Uses precomputed indexes to be fast.

[![npm version](https://img.shields.io/npm/v/synchronous-autocomplete.svg)](https://www.npmjs.com/package/synchronous-autocomplete)
[![build status](https://api.travis-ci.org/derhuerst/synchronous-autocomplete.svg?branch=master)](https://travis-ci.org/derhuerst/synchronous-autocomplete)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/synchronous-autocomplete.svg)
[![chat on gitter](https://badges.gitter.im/derhuerst.svg)](https://gitter.im/derhuerst)
[![support me on Patreon](https://img.shields.io/badge/support%20me-on%20patreon-fa7664.svg)](https://patreon.com/derhuerst)


## Installing

```shell
npm install synchronous-autocomplete
```


## Usage

Let's build a simple search for our fruit stand. We assign a `weight` property to each of them because some are bought more often and we want to push their ranking in the search results.

```js
const items = [ {
	id: 'apple',
	name: 'Juicy sour Apple.',
	weight: 3
}, {
	id: 'banana',
	name: 'Sweet juicy Banana!',
	weight: 2
}, {
	id: 'pome',
	name: 'Sour Pomegranate',
	weight: 5
} ]
```

Let's understand the terminology used by this tool:

- *item*: A thing to search for. In our example, apple, banana and pomegranate each are an *item*.
- *weight*: How important an *item* is.
- *token*: A word from the fully normalized item name. For example, to find an item named `Hey There!`, you may process its name into the *tokens* `hey` & `there`.
- *fragment*: A word from the normalized search query, which may partially match a *token*. E.g. the *fragment* `ther` (from the search query `Hey Ther`) partially matches the *token* `there`.
- *relevance*: How well an item fits to the search query.
- *score*: A combination of an item's *weight* and *relevance*. Used to rank search results.

In order to be as fast and disk-space-efficient as possible, `synchronous-autocomplete` requires five indexes to be prebuilt from the list of items. Check [the example code](example.js) for more details on how to build them. For our example, they would look like this:

```js
const tokens = { // internal item IDs, by token
	juicy: [0, 1],
	sour: [0, 3],
	apple: [0],
	sweet: [1],
	banana: [1],
	pomegranate: [3]
}
const weights = [ // item weights, by internal item ID
	3, // apple
	2, // banana
	5 // pome
]
const nrOfTokens = [ // nr of tokens, by internal item ID
	3, // apple
	3, // banana
	2 // pome
]
const scores = { // "uniqueness" of each token, by token
	juicy: 2 / 3, // 2 out of 3 items have the token "juicy"
	sour: 2 / 3,
	apple: 1 / 3,
	sweet: 1 / 3,
	banana: 1 / 3,
	pomegranate: 1 / 3
}
// In order to create smaller search indexes, we use numerical item IDs
// internally and maintain a mapping to their "real"/original IDs.
const originalIds = [
	'apple',
	'banana',
	'pome'
]
```

As the last step, we must define a function that normalizes search input into a list of *fragments*. Consider using this simple function:

```js
const normalize = require('normalize-for-search')

const tokenize = (str) => {
	return normalize(str).replace(/[^\w\s]/g, '').split(/\s+/g)
}
```

Now, we can query our index:

```js
const create = require('synchronous-autocomplete')

const autocomplete = create(tokens, scores, weights, nrOfTokens, originalIds, tokenize)

autocomplete('bana')
// [ {
//	id: 'banana',
//	relevance: 0.66667,
//	score: 0.83995
// } ]

autocomplete('sour')
// [ {
//	id: 'pomegranate',
//	relevance: 1.83333,
//	score: 3.13496
// }, {
//	id: 'apple',
//	relevance: 1.22222,
//	score: 1.76275
// } ]

autocomplete('aplle', 3, true) // note the typo
// [ {
//	id: 'apple',
//	relevance: 0.22222,
//	score: 0.3205
// } ]
```


## API

```js
const autocomplete = create(tokens, scores, weights, nrOfTokens, originalIds, tokenize)
autocomplete(query, limit = 6, fuzzy = false, completion = true)
```

- `tokens` must be an object with an array of internal *item* IDs per *token*.
- `scores` must be an object with a *token* score per *token*.
- `weights` must be an array with an *item* weight per internal *item* ID.
- `nrOfTokens` must be an array with the number of *tokens* per internal *item* ID.
- `originalIds` must be an array with the (real) *item* ID per internal *item* ID.
- `tokenize` must be a function that, given a search query, returns an array of *fragments*.


## Storing the index as protocol buffer

[Protocol buffers](https://developers.google.com/protocol-buffers/) (a.k. *protobuf*s) are a compact binary format for structured data serialization.

```js
const encode = require('synchronous-autocomplete/encode')
const fs = require('fs')

// encode & write the index
const encoded = encode({tokens, weights, nrOfTokens, scores, originalIds})
fs.writeFileSync('index.pbf', encoded)

// read & decode the index
const decoded = decode(fs.readFileSync('index.pbf'))
```


## Contributing

If you have a question or have difficulties using `synchronous-autocomplete`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/synchronous-autocomplete/issues).
