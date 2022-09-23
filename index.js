import {ok} from 'node:assert'
import hifo from 'hifo'
import leven from 'leven'

const internalId = Symbol('internal numeric ID')

const createAutocomplete = (index, tokenize) => {
	const {
		tokens,
		scores,
		weights,
		nrOfTokens,
		originalIds,
	} = index
	ok(tokens && typeof tokens === 'object', 'tokens must be an object')
	ok(scores && typeof scores === 'object', 'scores must be an object')
	ok(Array.isArray(weights), 'weights must be an array')
	ok(Array.isArray(nrOfTokens), 'nrOfTokens must be an array')
	ok(Array.isArray(originalIds), 'originalIds must be an array')

	const byFragment = (fragment, completion, fuzzy) => {
		const results = []
		const l = fragment.length

		if (tokens[fragment]) {
			const relevance = 1 + scores[fragment] + Math.sqrt(l)

			const ids = tokens[fragment]
			for (let i = 0; i < ids.length; i++) {
				const id = ids[i]
				if (!results[id]) results[id] = 0
				results[id] += relevance
			}
		}

		if (completion || fuzzy) {
			for (let t in tokens) {
				if (fragment === t) continue // has been dealt with above

				let relevance
				let distance

				// add-one smoothing
				if (completion && t.length > l && fragment === t.slice(0, l)) {
					relevance = 1 + scores[t] + l / t.length
				} else if (fuzzy && (distance = leven(fragment, t)) <= 3) {
					relevance = (1 + scores[t]) / (distance + 1)
				} else continue

				const ids = tokens[t]
				for (let i = 0; i < ids.length; i++) {
					const id = ids[i]
					if (!results[id]) results[id] = 0
					results[id] += relevance
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
			for (let id = 0; id < data[fragment].length; id++) {
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
				Object.defineProperty(results[id], internalId, {value: id})
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

export {
	internalId,
	createAutocomplete,
}
