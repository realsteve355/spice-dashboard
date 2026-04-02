// src/hooks/useColonyData.js
import { useState, useEffect } from 'react'

// Module-level cache — persists for the lifetime of the page session
const CACHE = {}
const LOADING = {}

const FILES = [
  'meta',
  'annual_summaries',
  'viability',
  'companies',
  'company_revenue',
  'citizens',
  'citizen_snapshots',
  'mcc',
  'services_by_year',
  'life_stories',
  'mcc_bills_sample',
]

async function fetchFile(name) {
  if (CACHE[name]) return CACHE[name]
  if (LOADING[name]) return LOADING[name]
  LOADING[name] = fetch(`/mars-data/${name}.json`)
    .then(r => {
      if (!r.ok) throw new Error(`Failed to load ${name}.json`)
      return r.json()
    })
    .then(data => {
      CACHE[name] = data
      return data
    })
  return LOADING[name]
}

export function useColonyData(files = FILES) {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all(files.map(f => fetchFile(f).then(d => [f, d])))
      .then(pairs => {
        if (!cancelled) {
          setData(Object.fromEntries(pairs))
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [])

  return { data, loading, error }
}

// Convenience: fetch a single file
export function useColonyFile(name) {
  return useColonyData([name])
}
