export async function fetchCitizens(colonyAddr) {
  if (!colonyAddr) return []
  try {
    const res = await fetch(`/api/citizens?colony=${colonyAddr}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const { citizens } = await res.json()
    return citizens || []
  } catch (err) {
    console.warn('[fetchCitizens] API failed:', err?.message)
    return []
  }
}
