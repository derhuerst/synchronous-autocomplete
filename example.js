import normalize from 'normalize-for-search'

import {buildIndex} from './build.js'
import {createAutocomplete} from './index.js'

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

const {tokens, scores, weights, nrOfTokens, originalIds} = buildIndex(tokenize, items)

const autocomplete = createAutocomplete(tokens, scores, weights, nrOfTokens, originalIds, tokenize)
console.log(autocomplete('bana'))
console.log(autocomplete('sour'))
console.log(autocomplete('aplle', 3, true)) // note the typo
