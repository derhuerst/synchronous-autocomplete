'use strict'

const buildIndexes = (tokenize, items) => {
	const originalIds = Object.create(null)
	const tokens = Object.create(null)
	const weights = Object.create(null)
	const nrOfTokens = Object.create(null)

	let currentId = 0
	const generateId = (type, oldId) => {
		currentId++
		const newId = currentId.toString(36)
		originalIds[newId] = oldId
		return newId
	}

	for (let item of items) {
		const id = generateId(item.id)
		const tokensOfItem = tokenize(item.name)
		for (let token of tokensOfItem) {
			if (!Array.isArray(tokens[token])) tokens[token] = []
			if (!tokens[token].includes(id)) tokens[token].push(id)
		}

		weights[id] = item.weight
		nrOfTokens[id] = tokensOfItem.length
	}

	const scores = Object.create(null)
	for (let token in tokens) {
		const nrOfItemsForToken = tokens[token].length
		scores[token] = nrOfItemsForToken / items.length
	}

	return {tokens, scores, weights, nrOfTokens, originalIds}
}

module.exports = buildIndexes
