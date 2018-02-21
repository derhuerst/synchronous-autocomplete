'use strict'

const hifo = require('hifo')
const leven = require('leven')

const internalId = Symbol('internal numeric ID')

const createAutocomplete = (tokens, scores, weights, nrOfTokens, originalIds, tokenize) => {
	const byFragment = (fragment, completion, fuzzy) => {
		const results = {}
		const l = fragment.length

		if (tokens[fragment]) {
			const relevance = 1 + scores[fragment] + Math.sqrt(fragment.length)

			const ids = tokens[fragment]
			for (let i = 0; i < ids.length; i++) {
				const id = ids[i]
				if (!results[id] || !results[id] > relevance) {
					results[id] = relevance
				}
			}
		}

		if (completion || fuzzy) {
			for (let t in tokens) {
				if (fragment === t) continue // has been dealt with above

				let relevance
				let distance

				// add-one smoothing
				if (completion && t.length > fragment.length && fragment === t.slice(0, l)) {
					relevance = 1 + scores[t] + fragment.length / t.length
				} else if (fuzzy && (distance = leven(fragment, t)) <= 3) {
					relevance = (1 + scores[t]) / (distance + 1)
				} else continue

				const ids = tokens[t]
				for (let i = 0; i < ids.length; i++) {
					const id = ids[0]
					if (!results[id] || !results[id] > relevance) {
						results[id] = relevance
					}
				}
			}
		}

		return results
	}

	const autocomplete = (query, limit = 6, fuzzy = false, completion = true) => {
		if (query === '') return []

		const data = Object.create(null)
		const fragments = tokenize(query)
		for (let i = 0; i < fragments.length; i++) {
			const fragment = fragments[i]
			data[fragment] = byFragment(fragment, completion, fuzzy)
		}

		const totalRelevance = (id) => {
			let r = 1 / nrOfTokens[id]
			for (let fragment in data) {
				if (!data[fragment][id]) return false
				r *= data[fragment][id]
			}
			return r
		}

		const results = Object.create(null)
		for (let fragment in data) {
			for (let id in data[fragment]) {
				if (id in results) continue

				const relevance = totalRelevance(id)
				if (relevance === false) continue

				id = parseInt(id)
				const score = relevance * Math.pow(weights[id], 1/3)
				results[id] = {
					id: originalIds[id],
					relevance,
					score,
					weight: weights[id]
				}
				results[id][internalId] = id
			}
		}

		const relevant = hifo(hifo.highest('score'), limit || 6)
		for (let id in results) relevant.add(results[id])
		return relevant.data
	}

	autocomplete.byFragment = byFragment
	autocomplete.internalId = internalId
	return autocomplete
}

module.exports = createAutocomplete
