'use strict'

const {Index} = require('./schema.proto.js')

const decode = (buf) => {
	const output = Index.decode(buf)

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
