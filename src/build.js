'use strict'

const buildIndexes = (tokenize, items) => {
	const tokens = Object.create(null)
	const weights = Object.create(null)
	const nrOfTokens = Object.create(null)

	for (let item of items) {
		const tokensOfItem = tokenize(item.name)
		for (let token of tokensOfItem) {
			if (!Array.isArray(tokens[token])) tokens[token] = []
			if (!tokens[token].includes(item.id)) tokens[token].push(item.id)
		}

		weights[item.id] = item.weight
		nrOfTokens[item.id] = tokensOfItem.length
	}

	const scores = Object.create(null)
	for (let token in tokens) {
		const nrOfItemsForToken = tokens[token].length
		scores[token] = nrOfItemsForToken / items.length
	}

	return {tokens, scores, weights, nrOfTokens}
}

module.exports = buildIndexes
