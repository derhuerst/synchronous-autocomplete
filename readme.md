# synchronous-autocomplete

**Fast, simple autocompletion.** Supports [autocompletion](https://en.wikipedia.org/wiki/Autocomplete) and [Levenshtein](https://en.wikipedia.org/wiki/Levenshtein_distance)-based fuzzy search. Uses precomputed indexes to be fast.

[![npm version](https://img.shields.io/npm/v/synchronous-autocomplete.svg)](https://www.npmjs.com/package/synchronous-autocomplete)
[![build status](https://api.travis-ci.org/derhuerst/synchronous-autocomplete.svg?branch=master)](https://travis-ci.org/derhuerst/synchronous-autocomplete)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/synchronous-autocomplete.svg)
[![chat on gitter](https://badges.gitter.im/derhuerst.svg)](https://gitter.im/derhuerst)


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

- *item*: A thing to search for. In our example, apple, banana and pomegranate are tree *items*.
- *weight*: How important an *item* is.
- *token*: A word from the fully processed search query. For example, to find an item named `Hey There!`, you may process its name into the *tokens* `hey` & `there`.
- *fragment*: A word from the process search query, which may partially match a token. E.g. the *fragment* `ther` (from the search query `Hey There!`) partially matches the *token* `there`.
- *relevance*: How well an item is matched by the search query.
- *score*: A combination of an item's *weight* and *relevance*. Use it to sort search results.

In order to be as fast and disk-space-efficient as possible, `synchronous-autocomplete` requires four indexes to be prebuilt from the list of items. For our example, they would look like this:

```js
const tokens = { // item IDs, by token
	juicy: ['apple', 'banana'],
	sour: ['apple', 'pomegranate'],
	apple: ['apple'],
	sweet: ['banana'],
	banana: ['banana'],
	pomegranate: ['pome']
}
const weights = { // item weights, by item ID
	apple: 3,
	banana: 2,
	pome: 5
}
const nrOfTokens = { // nr of tokens, by item ID
	apple: 3,
	banana: 3,
	pome: 2
}
const scores = { // "uniqueness" of each token, by token
	juicy: 2 / 3, // 2 out of 3 items have the token "juicy"
	sour: 2 / 3,
	apple: 1 / 3,
	sweet: 1 / 3,
	banana: 1 / 3,
	pomegranate: 1 / 3
}
```

See [the example code](example.js) for more details on how to build them.

Now, we can query our index:

```js
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
const autocomplete = create(tokens, scores, weights, nrOfTokens, tokenize)
autocomplete(query, limit = 6, fuzzy = false, completion = true)
```

`tokens` must be an object with an array of *item* IDs per *token*.
`scores` must be an object with a *token* score per *token*.
`weights` must be an object with an *item* weight per *item* ID.
`nrOfTokens` must be an object with the number of *tokens* per *item* ID.
`tokenize` must be a function that, given a search query, returns an array of *fragments*.


## Contributing

If you have a question or have difficulties using `synchronous-autocomplete`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/synchronous-autocomplete/issues).
