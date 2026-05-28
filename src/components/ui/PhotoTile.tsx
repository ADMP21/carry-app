'use client'
// src/components/ui/PhotoTile.tsx

interface PhotoTileProps {
  seed?: string
  tone?: string
  idStr?: string
  label?: string
  imageUrl?: string
}

export default function PhotoTile({ seed, tone, idStr, label, imageUrl }: PhotoTileProps) {
  if (imageUrl) {
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={seed || 'รูปภาพปัญหา'}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    )
  }

  return (
    <div className="photo-tile" style={{ '--tone': tone } as React.CSSProperties}>
      <div className="pt-id mono">{idStr || 'IMG-001'}</div>
      <div className="pt-icon mono">{seed || 'ภาพถ่าย'}</div>
      <div className="pt-label mono">
        <span>{label || 'ห้องทำงาน / 2569'}</span>
        <span>ไม่มีรูปภาพ</span>
      </div>
    </div>
  )
}
