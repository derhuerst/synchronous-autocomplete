'use strict'

const Pbf = require('pbf')

const {Index} = require('./schema.proto.js')

const decode = (buf) => {
	const pbf = new Pbf(buf)
	const output = Index.read(pbf)

	const index = {
		tokens: Object.create(null),
		weights: output.weights,
		nrOfTokens: output.nr_of_tokens,
		scores: Object.create(null),
		originalIds: output.original_ids
	}
	for (let i = 0; i < output.tokens.length; i++) {
		const t = output.tokens[i]
		index.tokens[t.name] = t.ids
	}
	for (let i = 0; i < output.scores.length; i++) {
		const s = output.scores[i]
		index.scores[s.token] = s.score
	}

	return index
}

module.exports = decode
