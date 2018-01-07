'use strict'

const normalize = require('normalize-for-search')

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

const tokens = Object.create(null)
const weights = Object.create(null)
const nrOfTokens = Object.create(null)

for (let item of items) {
	const tokensOfItem = tokenize(item.name)
	for (let token of tokensOfItem) {
		if (!Array.isArray(tokens[token])) tokens[token] = []
		tokens[token].push(item.id)
	}

	weights[item.id] = item.weight
	nrOfTokens[item.id] = tokensOfItem.length
}

const scores = Object.create(null)
for (let token in tokens) {
	const nrOfItemsForToken = tokens[token].length
	scores[token] = nrOfItemsForToken / items.length
}

// console.error(tokens)
// console.error(weights)
// console.error(nrOfTokens)
// console.error(scores)

const autocomplete = create(tokens, scores, weights, nrOfTokens, tokenize)
console.log(autocomplete('bana'))
console.log(autocomplete('sour'))
console.log(autocomplete('aplle', 3, true)) // note the typo
