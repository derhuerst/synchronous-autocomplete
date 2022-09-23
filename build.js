const roundTo = (v, p) => parseFloat(v.toFixed(p))

const buildIndex = (tokenize, items) => {
	const originalIds = []
	const tokens = Object.create(null)
	const weights = []
	const nrOfTokens = []

	let currentId = 0
	const generateId = (oldId) => {
		const newId = currentId++
		originalIds[newId] = oldId
		return newId
	}

	for (let item of items) {
		const id = generateId(item.id)
		const tokensOfItem = tokenize(item.name)
		for (let token of tokensOfItem) {
			if (!Array.isArray(tokens[token])) tokens[token] = [id]
			else tokens[token].push(id)
		}

		weights[id] = item.weight
		nrOfTokens[id] = tokensOfItem.length
	}

	const scores = Object.create(null)
	for (let token in tokens) {
		const nrOfItemsForToken = tokens[token].length
		const score = nrOfItemsForToken / items.length
		scores[token] = roundTo(score, 6 - Math.log10(score) | 0)
	}

	return {tokens, scores, weights, nrOfTokens, originalIds}
}

export {
	buildIndex,
}
