import { useState, useEffect, useCallback } from 'react'

function seenKey(colony, address) {
  return `spice_notif_seen_${colony}_${address?.toLowerCase()}`
}

function loadSeen(colony, address) {
  if (!colony || !address) return new Set()
  try {
    const stored = localStorage.getItem(seenKey(colony, address))
    return stored ? new Set(JSON.parse(stored)) : new Set()
  } catch { return new Set() }
}

function saveSeen(colony, address, set) {
  if (!colony || !address) return
  try {
    localStorage.setItem(seenKey(colony, address), JSON.stringify([...set]))
  } catch {}
}

/**
 * Poll /api/notifications every 30 s and track "seen" state in localStorage.
 * Returns { notifications, unseenCount, markAllSeen, refresh }
 */
export function useNotifications(colony, address) {
  const [notifications, setNotifications] = useState([])
  const [seenIds, setSeenIds] = useState(() => loadSeen(colony, address))

  // Re-sync seen set when colony/address changes (e.g. wallet switch)
  useEffect(() => {
    setSeenIds(loadSeen(colony, address))
  }, [colony, address])

  const fetchNotifications = useCallback(async () => {
    if (!colony || !address) return
    try {
      const r = await fetch(
        `/api/notifications?colony=${encodeURIComponent(colony)}&address=${encodeURIComponent(address.toLowerCase())}`
      )
      if (!r.ok) return
      const data = await r.json()
      setNotifications(data.notifications || [])
    } catch { /* network error — ignore */ }
  }, [colony, address])

  // Initial fetch + 30s polling
  useEffect(() => {
    fetchNotifications()
    const t = setInterval(fetchNotifications, 30_000)
    return () => clearInterval(t)
  }, [fetchNotifications])

  const unseenCount = notifications.filter(n => !seenIds.has(String(n.id))).length

  const markAllSeen = useCallback(() => {
    if (!colony || !address || notifications.length === 0) return
    const newSeen = new Set([...seenIds, ...notifications.map(n => String(n.id))])
    setSeenIds(newSeen)
    saveSeen(colony, address, newSeen)
  }, [seenIds, notifications, colony, address])

  return { notifications, unseenCount, markAllSeen, refresh: fetchNotifications }
}
