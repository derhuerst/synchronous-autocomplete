'use strict'

const normalize = require('normalize-for-search')

const buildIndexes = require('./build')
const create = require('.')

const tokenize = str => normalize(str).replace(/[^\w\s]/g, '').split(/\s+/g)

const items = [ {
	id: 'apple',
	name: 'Juicy sour Apple.',
	weight: 3
}, {
	id: 'banana',
	name: 'Sweet juicy Banana!',
	weight: 2
}, {
	id: 'pomegranate',
	name: 'Sour Pomegranate',
	weight: 5
} ]

const {tokens, scores, weights, nrOfTokens} = buildIndexes(tokenize, items)

// console.error(tokens)
// console.error(weights)
// console.error(nrOfTokens)
// console.error(scores)

const autocomplete = create(tokens, scores, weights, nrOfTokens, tokenize)
console.log(autocomplete('bana'))
console.log(autocomplete('sour'))
console.log(autocomplete('aplle', 3, true)) // note the typo
