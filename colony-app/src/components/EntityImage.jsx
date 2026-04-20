/**
 * EntityImage — displays a profile photo, company logo, or asset thumbnail.
 * If editable=true, tapping the image opens a file picker and uploads to /api/media.
 *
 * Props:
 *   colony      — colony slug, e.g. "daves-colony"
 *   entityType  — "citizen" | "company" | "asset"
 *   entityId    — wallet address (citizen/company) or token ID string (asset)
 *   editable    — boolean, show upload affordance
 *   size        — diameter in px (default 72)
 *   label       — fallback text/initials shown when no image (default first char of entityId)
 */
import { useState, useRef } from 'react'
import { C } from '../theme'

const MAX_PX  = 400   // max dimension before upload
const QUALITY = 0.82  // JPEG quality

function resizeToJpeg(dataUrl, maxPx) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const w = Math.round(img.width  * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', QUALITY))
    }
    img.onerror = reject
    img.src = dataUrl
  })
}

export default function EntityImage({ colony, entityType, entityId, editable, size = 72, label }) {
  const [imgError,  setImgError]  = useState(false)
  const [localUrl,  setLocalUrl]  = useState(null)   // base64 preview right after upload
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState(null)
  const inputRef = useRef()

  // Construct public Supabase URL from VITE_SUPABASE_URL env var
  const supaBase = import.meta.env.VITE_SUPABASE_URL
  const remoteSrc = supaBase && colony && entityId
    ? `${supaBase}/storage/v1/object/public/colony-media/${colony}/${entityType}/${entityId}.jpg`
    : null

  const src           = localUrl || remoteSrc
  const showPlaceholder = !src || imgError

  // Derive fallback initials
  const initials = (label || String(entityId || '?'))
    .replace(/^0x/i, '')
    .slice(0, 2)
    .toUpperCase()

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''   // reset so same file can be re-picked
    if (!file) return
    setUploadErr(null)
    setUploading(true)
    try {
      // Read original file
      const raw = await new Promise((res, rej) => {
        const reader = new FileReader()
        reader.onload  = ev => res(ev.target.result)
        reader.onerror = rej
        reader.readAsDataURL(file)
      })
      // Resize + convert to JPEG
      const dataUrl = await resizeToJpeg(raw, MAX_PX)

      const r = await fetch('/api/media', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ colony, entityType, entityId, dataUrl }),
      })
      if (!r.ok) {
        const { error } = await r.json().catch(() => ({ error: r.statusText }))
        throw new Error(error)
      }
      // Show local preview immediately — avoids waiting for CDN propagation
      setLocalUrl(dataUrl)
      setImgError(false)
    } catch (err) {
      setUploadErr(err.message || 'Upload failed')
    }
    setUploading(false)
  }

  const radius = size / 2

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div
        onClick={() => editable && !uploading && inputRef.current?.click()}
        style={{
          width:         size,
          height:        size,
          borderRadius:  radius,
          background:    showPlaceholder ? C.white : 'transparent',
          border:        `1px solid ${C.border}`,
          overflow:      'hidden',
          position:      'relative',
          cursor:        editable ? 'pointer' : 'default',
          flexShrink:    0,
        }}
      >
        {/* Image */}
        {!showPlaceholder && (
          <img
            src={src}
            alt=""
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}

        {/* Placeholder — initials in a muted circle */}
        {showPlaceholder && (
          <div style={{
            width:          '100%',
            height:         '100%',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            background:     C.white,
            color:          C.faint,
            fontSize:       size * 0.3,
            fontFamily:     "'IBM Plex Mono', monospace",
            letterSpacing:  '0.05em',
            userSelect:     'none',
          }}>
            {initials}
          </div>
        )}

        {/* Edit overlay */}
        {editable && (
          <div style={{
            position:   'absolute',
            bottom:     0, left: 0, right: 0,
            background: 'rgba(0,0,0,0.45)',
            color:      '#fff',
            fontSize:   size > 56 ? 10 : 8,
            textAlign:  'center',
            padding:    '3px 0',
            letterSpacing: '0.05em',
          }}>
            {uploading ? '…' : 'photo'}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </div>

      {uploadErr && (
        <div style={{ fontSize: 10, color: C.red, maxWidth: size * 2, textAlign: 'center' }}>
          {uploadErr}
        </div>
      )}
    </div>
  )
}
