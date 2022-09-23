'use strict'

import normalize from 'normalize-for-search'
import benchmark from 'benchmark'

import {buildIndex as build} from '../build.js'
import {encodeIndex as encode} from '../encode.js'
import {createAutocomplete as create} from '../index.js'
import {decodeIndex as decode} from '../decode.js'

// todo: use import assertions once they're supported by Node.js & ESLint
// https://github.com/tc39/proposal-import-assertions
import {createRequire} from 'module'
const require = createRequire(import.meta.url)
const data = require('./data.json') // 13k station

const tokenize = str => normalize(str).replace(/[^\w\s]/g, '').split(/\s+/g)

const index = build(tokenize, data)
const encodedIndex = encode(index)

const autocomplete = create(index, tokenize)

new benchmark.Suite()

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
