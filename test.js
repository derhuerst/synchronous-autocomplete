import normalize from 'normalize-for-search'
import {test} from 'tape'
import leven from 'leven'
import sortBy from 'lodash.sortby'

import {createAutocomplete as create} from './index.js'
import {buildIndex as build} from './build.js'
import {encodeIndex as encode} from './encode.js'
import {decodeIndex as decode} from './decode.js'

const tokens = { // items by token
	one: [0],
	two: [1],
	three: [1],
	four: [0, 1]
}
const scores = {
	one: 1 / 2,
	two: 1 / 2,
	three: 1 / 2,
	four: 1
}
const weights = [10, 20]
const nrOfTokens = [2, 3]
const originalIds = ['A', 'B']

const tokenize = str => normalize(str).split(/\s+/g)

const autocomplete = create({tokens, scores, weights, nrOfTokens, originalIds}, tokenize)

test('byFragment finds an exact match', (t) => {
	t.plan(1)
	const results = autocomplete.byFragment('four', false, false)

	t.deepEqual(results, [
		// 1 + scores[fragment] + Math.sqrt(fragment.length)
		1 + scores.four + 2,
		1 + scores.four + 2
	])
})

test('byFragment finds a match by first letters', (t) => {
	t.plan(2)

	t.deepEqual(autocomplete.byFragment('fou', true, false), [
		// 1 + scores[fragment] + fragmentLength / tokenLength
		1 + scores.four + 3 / 4,
		1 + scores.four + 3 / 4
	])
	t.deepEqual(autocomplete.byFragment('fou', false, false), [])
})

test('byFragment finds a match despite typos', (t) => {
	t.plan(1)
	const results = autocomplete.byFragment('there', false, true) // typo

	// (1 + scores[fragment]) / (1 + levenshteinDistance)
	const expected = (1 + scores.three) / (1 + leven('there', 'three'))
	t.equal(results[1], expected)
})

test('autocomplete returns an array', (t) => {
	t.plan(2)
	t.ok(Array.isArray(autocomplete('', 3)))
	t.ok(Array.isArray(autocomplete('one', 3)))
})

test('autocomplete returns an empty array for an empty query', (t) => {
	t.plan(1)
	const results = autocomplete('', 3)

	t.equal(results.length, 0)
})

test('autocomplete sorts by score', (t) => {
	t.plan(1)
	const results = autocomplete('four', 3)

	t.deepEqual(results, sortBy(results, 'score').reverse())
})

test('autocomplete calculates the relevance & score correctly', (t) => {
	t.plan(7)
	const results = autocomplete('fou', 3, false, true)
	t.equal(results.length, 2)


	const r0 = (1 + scores.four + 3 / 4) / 2 // 3 of 4 letters matched, 2 tokens
	const s0 = r0 * Math.pow(10, 1/3)
	t.equal(results[0].id, 'A')
	t.equal(results[0].relevance.toFixed(10), r0.toFixed(10))
	t.equal(results[0].score.toFixed(10), s0.toFixed(10))

	const r1 = (1 + scores.four + 3 / 4) / 3 // 3 of 4 letters matched, 3 tokens
	const s1 = r1 * Math.pow(20, 1/3)
	t.equal(results[1].id, 'B')
	t.equal(results[1].relevance.toFixed(10), r1.toFixed(10))
	t.equal(results[1].score.toFixed(10), s1.toFixed(10))
})

test('autocomplete limits the number of results', (t) => {
	t.plan(1)
	t.equal(autocomplete('four', 1).length, 1)
})

test('autocomplete exposes the internal ID', (t) => {
	t.plan(6)
	const [r0, r1] = autocomplete('fou', 3, false, true)

	t.equal(r0.id, 'A')
	t.equal(r0[autocomplete.internalId], 0)
	const desc0 = Object.getOwnPropertyDescriptor(r0, autocomplete.internalId)
	t.equal(desc0.enumerable, false)

	t.equal(r1.id, 'B')
	t.equal(r1[autocomplete.internalId], 1)
	const desc1 = Object.getOwnPropertyDescriptor(r1, autocomplete.internalId)
	t.equal(desc1.enumerable, false)
})

test('build takes duplicate tokens into account', (t) => {
	const {tokens, nrOfTokens} = build(tokenize, [
		{id: 'A', name: 'foo bar foo', weight: 10}, // "foo" twice
		{id: 'B', name: 'foo baz', weight: 10}
	])

	t.deepEqual(tokens, Object.assign(Object.create(null), {
		foo: [0, 0, 1],
		bar: [0],
		baz: [1]
	}))
	t.deepEqual(nrOfTokens, [3, 2])
	t.end()
})

test('autocomplete takes duplicate tokens into account', (t) => {
	// For the query "foo ba", B should rank higher, except if the duplicate
	// token "foo" in A is taken into account. We assert this.
	// A: foo bar foo
	// B: foo baz
	const tokens = { // items by token
		foo: [0, 0, 1],
		bar: [0],
		baz: [1]
	}
	const scores = {
		foo: 1,
		bar: 1 / 2,
		baz: 1 / 2
	}
	const weights = [10, 10]
	const nrOfTokens = [3, 2]
	const originalIds = ['A', 'B']

	const a = create({tokens, scores, weights, nrOfTokens, originalIds}, tokenize)
	const [r0, r1] = a('foo ba', 2, true, false)

	t.equal(r0.id, 'A')
	t.equal(r1.id, 'B')
	t.ok(r0.relevance > r1.relevance)
	t.end()
})

test('encode, decode works', (t) => {
	const index = {tokens, scores, weights, nrOfTokens, originalIds}
	const index2 = decode(encode(index))

	t.ok(index2)
	t.deepEqual(index2.tokens, Object.assign(Object.create(null), index.tokens))
	t.deepEqual(index2.scores, Object.assign(Object.create(null), index.scores))
	t.deepEqual(index2.weights, index.weights)
	t.deepEqual(index2.nrOfTokens, index.nrOfTokens)
	t.deepEqual(index2.originalIds, index.originalIds)
	t.end()
})
