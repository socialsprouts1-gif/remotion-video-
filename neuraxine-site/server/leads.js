// Lead search: Google Places (New) when a key is set, otherwise sample data.
import { makeLeads, leadCategories } from '../src/demos/data.js'
import { scoreLead, draftMessage } from '../src/demos/engine.js'
import { aiDraftOutreach } from './ai.js'

const FIELDS = 'places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber,places.googleMapsUri'

async function placesSearch(key, query, fetchImpl) {
  const res = await fetchImpl('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': FIELDS },
    body: JSON.stringify({ textQuery: query, maxResultCount: 8, languageCode: 'en', regionCode: 'IN' }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) throw new Error(`Places API ${res.status}`)
  const data = await res.json()
  return (data.places || []).map((p) => {
    const lead = {
      name: p.displayName?.text || 'Unknown',
      area: (p.formattedAddress || '').split(',').slice(-4, -3)[0]?.trim() || '',
      address: p.formattedAddress,
      website: Boolean(p.websiteUri),
      websiteUrl: p.websiteUri || null,
      phone: p.nationalPhoneNumber || null,
      mapsUrl: p.googleMapsUri || null,
      whatsapp: Boolean(p.nationalPhoneNumber && /^0?[6-9]/.test(p.nationalPhoneNumber.replace(/\s/g, ''))),
      rating: p.rating ?? null,
      reviews: p.userRatingCount ?? 0,
    }
    return { ...lead, score: scoreLead(lead) }
  })
}

export async function searchLeads({ category, city, ai, env, fetchImpl }) {
  const benefit = leadCategories[category].benefit
  let leads
  let mode = 'sample'
  if (env.GOOGLE_PLACES_API_KEY) {
    try {
      leads = await placesSearch(env.GOOGLE_PLACES_API_KEY, `${category} in ${city}`, fetchImpl)
      mode = 'live'
    } catch (err) {
      console.warn('[leads] Places search failed, using sample data:', err.message)
    }
  }
  if (!leads) leads = makeLeads(category, city)
  leads.sort((a, b) => b.score - a.score)

  const aiDrafts = await aiDraftOutreach(ai, { leads, category, city, benefit })
  const withDrafts = leads.map((l) => ({ ...l, draft: aiDrafts?.[l.name] || draftMessage(l, category, city, benefit) }))
  return { mode, ai: Boolean(aiDrafts), leads: withDrafts }
}
