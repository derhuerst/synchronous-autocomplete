import * as IndexSchema from './lib/schema.proto.cjs'
const {Index} = IndexSchema

// todo: move into index.js?

const encodeIndex = (index) => {
	const input = {
		tokens: [],
		weights: index.weights,
		nr_of_tokens: index.nrOfTokens,
		scores: [],
		original_ids: index.originalIds
	}

	// It would be more efficient not to create these lists, but to directly write
	// into the buffer item by item.
	// todo
	for (let token in index.tokens) {
		if (!Object.prototype.hasOwnProperty.call(index.tokens, token)) continue
		input.tokens.push({
			name: token, ids: index.tokens[token]
		})
	}
	for (let token in index.scores) {
		if (!Object.prototype.hasOwnProperty.call(index.scores, token)) continue
		input.scores.push({
			token, score: index.scores[token]
		})
	}

	return Index.encode(input)
}

export {
	encodeIndex,
}
