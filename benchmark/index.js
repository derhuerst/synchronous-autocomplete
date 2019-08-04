'use strict'

const normalize = require('normalize-for-search')
const {Suite} = require('benchmark')

const build = require('../build')
const data = require('./data.json') // 13k stations
const encode = require('../encode')
const create = require('..')
const decode = require('../decode')

const tokenize = str => normalize(str).replace(/[^\w\s]/g, '').split(/\s+/g)

const index = build(tokenize, data)
const encodedIndex = encode(index)

const {tokens, scores, weights, nrOfTokens, originalIds} = index
const autocomplete = create(tokens, scores, weights, nrOfTokens, originalIds, tokenize)

new Suite()

.add('13k VBB stations, "friedrich", 3 results, completion', () => {
	autocomplete('friedrich', 3, false, true)
})
.add('index decoding', () => {
	decode(encodedIndex)
})

.on('error', (err) => {
	console.error(err)
	process.exitCode = 1
})
.on('cycle', (e) => {
	console.log(e.target.toString())
})
.run()
