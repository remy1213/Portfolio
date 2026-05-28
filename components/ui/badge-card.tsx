'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export interface BadgeColors {
  cardBg: string
  accentColor: string
  nameColor: string
  roleColor: string
  metaColor: string
  footerBg: string
  footerText: string
  ringColor: string
}

export interface BadgeData {
  name: string
  role: string
  roleType: string
  eventCode: string
  date: string
  location: string
  venue: string
  address: string
  website: string
  email: string
  phone: string
  company: string
  tagline: string
  colors: BadgeColors
}

const SPRING_STIFFNESS = 0.07
const SPRING_DAMPING = 0.75
const CARD_W = 260
const CARD_H = 380
const ANCHOR_Y = 40
const STRAP_LENGTH = 280

function Barcode({ color }: { color: string }) {
  const bars = [3,1,2,1,3,2,1,2,1,3,1,2,2,1,1,3,2,1,2,1,3,1,2,1,3,2,1,1,2,3,1,2,1,2,3]
  let x = 0
  return (
    <svg width="200" height="36" viewBox="0 0 200 36" style={{ display: 'block' }}>
      {bars.map((w, i) => {
        const rect = i % 2 === 0 ? (
          <rect key={i} x={x} y={0} width={w * 3.5} height={36} fill={color} rx={0.3} />
        ) : null
        x += w * 3.5
        return rect
      })}
    </svg>
  )
}

function CardFront({ data, shinePct }: { data: BadgeData; shinePct: { x: number; y: number } }) {
  const c = data.colors
  return (
    <div
      className="absolute inset-0 rounded-2xl overflow-hidden"
      style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
    >
      <div className="relative w-full h-full" style={{ background: c.cardBg }}>
        {/* Tilt shine */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: `radial-gradient(ellipse at ${shinePct.x}% ${shinePct.y}%, rgba(255,255,255,0.07) 0%, transparent 60%)`,
            zIndex: 10,
          }}
        />
        {/* Ring hole */}
        <div className="absolute" style={{ top: 14, left: '50%', transform: 'translateX(-50%)', width: 14, height: 14, borderRadius: '50%', background: '#000', border: '1.5px solid #333', zIndex: 11 }} />
        
        {/* Top meta row with name instead of Vercel logo */}
        <div className="absolute top-0 left-0 right-0 flex items-start justify-between px-4" style={{ zIndex: 12, paddingTop: 34 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em', color: 'white' }}>
            REMY WILKINS
          </span>
          </div>

        {/* Your photo */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: 58,
            left: 0,
            right: 0,
            height: 220,
            zIndex: 3,
            overflow: 'hidden',
          }}
        >
          <img
            src="/me.jpg"
            alt="Remy Wilkins"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center center',
            }}
            draggable={false}
          />
        </div>

        {/* Cursor icon */}
        <div className="absolute pointer-events-none" style={{ top: 150, left: 24, zIndex: 6 }}>
          <svg width="18" height="22" viewBox="0 0 22 26" fill="none">
            <path d="M1 1L1 20.5L6 15.5L9.5 23L12 22L8.5 14.5L15.5 14.5L1 1Z" fill={c.metaColor} stroke={c.cardBg} strokeWidth="1.5" />
          </svg>
        </div>    
        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-end" style={{ zIndex: 7 }}>
          <div className="px-5 pb-2">
            <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 32, lineHeight: 1.05, color: c.nameColor, letterSpacing: '-0.02em' }}>{data.name}</h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em', color: c.roleColor, marginTop: 6 }}>{data.roleType.toUpperCase()}</p>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '10px 0' }} />
          <div className="px-5 pb-3 flex items-end justify-between">
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: c.metaColor, lineHeight: 1.7 }}>{data.venue.toUpperCase()}</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: c.metaColor, opacity: 0.6 }}>{data.address.toUpperCase()}</p>
            </div>

          </div>
          <div className="flex items-center justify-center" style={{ background: c.footerBg, height: 36 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', color: c.footerText }}>{data.website}</span>
          </div>
        </div>
        {/* Edge gloss */}
        <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.4)' }} />
      </div>
    </div>
  )
}

function CardBack({ data, shinePct }: { data: BadgeData; shinePct: { x: number; y: number } }) {
  const c = data.colors
  const qrValue = data.website
    ? data.website.startsWith('http') ? data.website : `https://${data.website}`
    : 'https://example.com'

  return (
    <div
      className="absolute inset-0 rounded-2xl overflow-hidden"
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
      }}
    >
      <div className="relative w-full h-full flex flex-col" style={{ background: c.cardBg }}>
        {/* Shine */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: `radial-gradient(ellipse at ${100 - shinePct.x}% ${shinePct.y}%, rgba(255,255,255,0.07) 0%, transparent 60%)`,
            zIndex: 10,
          }}
        />
        {/* Ring hole */}
        <div className="absolute" style={{ top: 14, left: '50%', transform: 'translateX(-50%)', width: 14, height: 14, borderRadius: '50%', background: '#000', border: '1.5px solid #333', zIndex: 11 }} />

        {/* Top accent bar */}
        <div style={{ height: 4, background: c.accentColor, flexShrink: 0 }} />
        
        {/* Watermark */}
        <div
          className="absolute pointer-events-none select-none"
          style={{ top: -20, right: -30, fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 200, lineHeight: 1, color: c.accentColor, opacity: 0.04, letterSpacing: '-0.05em', zIndex: 1 }}
        >
          {data.eventCode}
        </div>

        <div className="flex flex-col px-5" style={{ zIndex: 5, gap: 7, flex: 1, paddingTop: 28 }}>

          {/* Name instead of Vercel logo */}
          <div className="flex items-center justify-between">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em', color: 'white' }}>
              REMY WILKINS
            </span>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', color: c.roleColor }}>
              {data.eventCode} / BADGE
            </p>
          </div>

          {/* Company name */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 17, color: c.nameColor, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {data.company || 'Company Name'}
            </h3>
            {data.tagline && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.04em', color: c.metaColor, lineHeight: 1.4, opacity: 0.7, marginTop: 3 }}>
                {data.tagline}
              </p>
            )}
          </div>

          <div style={{ height: 1, background: `${c.accentColor}30` }} />

          {/* QR code + contact info */}
          <div className="flex items-start" style={{ gap: 10 }}>
            <div className="rounded-md overflow-hidden flex-shrink-0" style={{ padding: 5, background: '#ffffff' }}>
              <QRCodeSVG value={qrValue} size={78} bgColor="#ffffff" fgColor="#000000" level="M" />
            </div>
            <div className="flex flex-col flex-1 min-w-0" style={{ gap: 5, paddingTop: 1 }}>
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.18em', color: c.metaColor, marginBottom: 2 }}>SCAN TO VISIT</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.03em', color: c.accentColor, fontWeight: 600, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.website}</p>
              </div>
              {data.email && (
                <div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.15em', color: c.metaColor, marginBottom: 2 }}>EMAIL</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, color: c.roleColor, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.email}</p>
                </div>
              )}
              {data.phone && (
                <div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.15em', color: c.metaColor, marginBottom: 2 }}>PHONE</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, color: c.roleColor, lineHeight: 1.3, whiteSpace: 'nowrap' }}>{data.phone}</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ height: 1, background: `${c.accentColor}30` }} />

          {/* Address */}
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.18em', color: c.metaColor, marginBottom: 4 }}>ADDRESS</p>
            <div className="flex items-start justify-between" style={{ gap: 8 }}>
              <div className="min-w-0 flex-1">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: c.roleColor, lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.venue}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: c.roleColor, opacity: 0.7, lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.address}</p>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: c.roleColor, opacity: 0.6, textAlign: 'right', flexShrink: 0, whiteSpace: 'nowrap' }}>{data.location}</p>
            </div>
          </div>

          <div style={{ height: 1, background: `${c.accentColor}30` }} />

          {/* Barcode */}
          <div>
            <Barcode color={c.accentColor + 'aa'} />
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 7, letterSpacing: '0.22em', color: c.metaColor, opacity: 0.4, marginTop: 3 }}>
              {'*' + data.name.replace(/\s/g, '').toUpperCase().slice(0, 12).padEnd(12, '0') + '*'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 mt-auto" style={{ background: c.footerBg, height: 36, flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', color: c.footerText }}>{data.website}</span>
        </div>

        {/* Edge gloss */}
        <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.4)' }} />
      </div>
    </div>
  )
}

export default function BadgeCard({ data }: { data: BadgeData }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const pos = useRef({ x: 0, y: 0 })
  const vel = useRef({ x: 0, y: 0 })
  const tilt = useRef({ rx: 0, ry: 0 })
  const tiltTarget = useRef({ rx: 0, ry: 0 })
  const dragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const hasMounted = useRef(false)
  const rafId = useRef<number>(0)
  const didDrag = useRef(false)

  const [shinePct, setShinePct] = useState({ x: 50, y: 50 })
  const [flipped, setFlipped] = useState(false)
  const [flipAngle, setFlipAngle] = useState(0)
  const flipRef = useRef(0)
  const flipTarget = useRef(0)
  const flipRaf = useRef<number>(0)

  const getAnchor = useCallback(() => {
    if (!containerRef.current) return { x: 0, y: ANCHOR_Y }
    const rect = containerRef.current.getBoundingClientRect()
    return { x: rect.width * 0.5, y: ANCHOR_Y }
  }, [])

  const drawRope = useCallback((colors: BadgeColors) => {
    const canvas = canvasRef.current
    if (!canvas || !containerRef.current) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = containerRef.current.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, rect.width, rect.height)

    const anchor = getAnchor()
    const cardTopX = pos.current.x + CARD_W / 2
    const cardTopY = pos.current.y - 18
    const midY = anchor.y + (cardTopY - anchor.y) * 0.5

    const steps = 80
    type Pt = { x: number; y: number; tx: number; ty: number }
    const pts: Pt[] = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const mt = 1 - t
      const x =
        mt * mt * mt * anchor.x +
        3 * mt * mt * t * anchor.x +
        3 * mt * t * t * cardTopX +
        t * t * t * cardTopX
      const y =
        mt * mt * mt * anchor.y +
        3 * mt * mt * t * midY +
        3 * mt * t * t * midY +
        t * t * t * cardTopY
      const dx =
        3 * mt * mt * (anchor.x - anchor.x) +
        6 * mt * t * (cardTopX - anchor.x) +
        3 * t * t * (cardTopX - cardTopX)
      const dy =
        3 * mt * mt * (midY - anchor.y) +
        6 * mt * t * (midY - midY) +
        3 * t * t * (cardTopY - midY)
      const len = Math.hypot(dx, dy) || 1
      pts.push({ x, y, tx: dx / len, ty: dy / len })
    }

    const strapHalf = 15

    const buildEdgePath = (sign: number) => {
      ctx.beginPath()
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]
        const nx = -p.ty * sign
        const ny = p.tx * sign
        const x = p.x + nx * strapHalf
        const y = p.y + ny * strapHalf
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
    }

    // Drop shadow
    ctx.save()
    ctx.beginPath()
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]
      const nx = -p.ty
      const ny = p.tx
      if (i === 0) ctx.moveTo(p.x + nx * strapHalf, p.y + ny * strapHalf)
      else ctx.lineTo(p.x + nx * strapHalf, p.y + ny * strapHalf)
    }
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i]
      const nx = -p.ty
      const ny = p.tx
      ctx.lineTo(p.x - nx * strapHalf, p.y - ny * strapHalf)
    }
    ctx.closePath()
    ctx.fillStyle = 'rgba(0,0,0,0.45)'
    ctx.filter = 'blur(4px)'
    ctx.fill()
    ctx.restore()

    // Strap fill
    ctx.save()
    ctx.beginPath()
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]
      const nx = -p.ty
      const ny = p.tx
      if (i === 0) ctx.moveTo(p.x + nx * strapHalf, p.y + ny * strapHalf)
      else ctx.lineTo(p.x + nx * strapHalf, p.y + ny * strapHalf)
    }
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i]
      const nx = -p.ty
      const ny = p.tx
      ctx.lineTo(p.x - nx * strapHalf, p.y - ny * strapHalf)
    }
    ctx.closePath()
    ctx.fillStyle = '#0a0a0a'
    ctx.fill()
    const midPt = pts[Math.floor(pts.length / 2)]
    const grad = ctx.createLinearGradient(midPt.x - strapHalf, midPt.y, midPt.x + strapHalf, midPt.y)
    grad.addColorStop(0, 'rgba(255,255,255,0.08)')
    grad.addColorStop(0.4, 'rgba(255,255,255,0)')
    grad.addColorStop(0.6, 'rgba(0,0,0,0)')
    grad.addColorStop(1, 'rgba(0,0,0,0.4)')
    ctx.fillStyle = grad
    ctx.fill()
    ctx.restore()

    // Strap text — REMY / RW instead of Ship 26
    const cumLen: number[] = [0]
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].x - pts[i - 1].x
      const dy = pts[i].y - pts[i - 1].y
      cumLen.push(cumLen[i - 1] + Math.hypot(dx, dy))
    }
    const totalLen = cumLen[cumLen.length - 1]

    const sampleAt = (targetLen: number) => {
      let lo = 0, hi = cumLen.length - 1
      while (lo < hi) {
        const mid = (lo + hi) >> 1
        if (cumLen[mid] < targetLen) lo = mid + 1
        else hi = mid
      }
      return pts[Math.max(0, Math.min(lo, pts.length - 1))]
    }

    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const labelSpacing = 130
    const startOffset = 60
    for (let d = startOffset; d < totalLen - 20; d += labelSpacing) {
      const p = sampleAt(d)
      const angle = Math.atan2(p.ty, p.tx)
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(angle)
      ctx.fillStyle = 'rgba(255,255,255,0.92)'
      ctx.font = '700 13px "Geist", system-ui, sans-serif'
      ctx.fillText('REMY', -10, 0)
      const tagW = 16
      const tagH = 12
      const tagX = 16
      ctx.strokeStyle = 'rgba(255,255,255,0.92)'
      ctx.lineWidth = 1
      ctx.strokeRect(tagX - tagW / 2, -tagH / 2, tagW, tagH)
      ctx.font = '700 8px "Geist Mono", ui-monospace, monospace'
      ctx.fillText('RW', tagX, 0.5)
      ctx.restore()
    }
    ctx.restore()

    // Edge highlights
    ctx.save()
    buildEdgePath(1)
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.stroke()
    buildEdgePath(-1)
    ctx.strokeStyle = 'rgba(0,0,0,0.6)'
    ctx.stroke()
    ctx.restore()

    // Swivel clip
    const clipTopY = cardTopY
    const cardRingY = pos.current.y + 16

    ctx.save()
    ctx.translate(cardTopX, clipTopY)
    ctx.save()
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.filter = 'blur(4px)'
    ctx.beginPath()
    ctx.roundRect(-10, 0, 20, 26, 4)
    ctx.fill()
    ctx.restore()
    const clipGrad = ctx.createLinearGradient(-10, 0, 10, 0)
    clipGrad.addColorStop(0, '#0d0d0d')
    clipGrad.addColorStop(0.5, '#2e2e2e')
    clipGrad.addColorStop(1, '#070707')
    ctx.fillStyle = clipGrad
    ctx.beginPath()
    ctx.roundRect(-10, 0, 20, 26, 4)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.14)'
    ctx.beginPath()
    ctx.roundRect(-8, 3, 3, 20, 1.5)
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.7)'
    ctx.lineWidth = 0.7
    ctx.beginPath()
    ctx.roundRect(-10, 0, 20, 26, 4)
    ctx.stroke()
    ctx.restore()

    ctx.save()
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 2.2
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(cardTopX, clipTopY + 26)
    ctx.lineTo(cardTopX, cardRingY + 2)
    ctx.stroke()
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.moveTo(cardTopX - 0.6, clipTopY + 26)
    ctx.lineTo(cardTopX - 0.6, cardRingY + 2)
    ctx.stroke()
    ctx.restore()
  }, [getAnchor])

  const animate = useCallback(() => {
    if (!hasMounted.current) return
    const card = cardRef.current
    if (!card) return

    if (!dragging.current) {
      const anchor = getAnchor()
      const restX = anchor.x - CARD_W / 2
      const restY = anchor.y + STRAP_LENGTH
      vel.current.x += (restX - pos.current.x) * SPRING_STIFFNESS
      vel.current.y += (restY - pos.current.y) * SPRING_STIFFNESS
      vel.current.x *= SPRING_DAMPING
      vel.current.y *= SPRING_DAMPING
      pos.current.x += vel.current.x
      pos.current.y += vel.current.y
    }

    tilt.current.rx += (tiltTarget.current.rx - tilt.current.rx) * 0.1
    tilt.current.ry += (tiltTarget.current.ry - tilt.current.ry) * 0.1

    card.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) rotateX(${tilt.current.rx}deg) rotateY(${tilt.current.ry}deg)`

    drawRope((card as any).__badgeColors || { accentColor: '#888', ringColor: '#888' })
    rafId.current = requestAnimationFrame(animate)
  }, [getAnchor, drawRope])

  const animateFlip = useCallback(() => {
    const diff = flipTarget.current - flipRef.current
    flipRef.current += diff * 0.12
    setFlipAngle(flipRef.current)
    if (Math.abs(diff) > 0.1) {
      flipRaf.current = requestAnimationFrame(animateFlip)
    } else {
      flipRef.current = flipTarget.current
      setFlipAngle(flipTarget.current)
    }
  }, [])

  const triggerFlip = useCallback(() => {
    const next = flipped ? 0 : 180
    flipTarget.current = next
    setFlipped(!flipped)
    cancelAnimationFrame(flipRaf.current)
    flipRaf.current = requestAnimationFrame(animateFlip)
  }, [flipped, animateFlip])

  useEffect(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    pos.current = { x: rect.width / 2 - CARD_W / 2, y: ANCHOR_Y + STRAP_LENGTH }
    hasMounted.current = true
    rafId.current = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(rafId.current)
      cancelAnimationFrame(flipRaf.current)
    }
  }, [animate])

  useEffect(() => {
    if (cardRef.current) {
      (cardRef.current as any).__badgeColors = data.colors
    }
  }, [data.colors])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragging.current = true
    didDrag.current = false
    dragOffset.current = {
      x: e.clientX - (containerRef.current?.getBoundingClientRect().left ?? 0) - pos.current.x,
      y: e.clientY - (containerRef.current?.getBoundingClientRect().top ?? 0) - pos.current.y,
    }
    document.body.style.cursor = 'grabbing'
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const lx = e.clientX - rect.left
    const ly = e.clientY - rect.top
    if (dragging.current) {
      const nx = lx - dragOffset.current.x
      const ny = ly - dragOffset.current.y
      const dx = nx - pos.current.x
      const dy = ny - pos.current.y
      if (Math.abs(dx) + Math.abs(dy) > 4) didDrag.current = true
      pos.current.x = nx
      pos.current.y = ny
      vel.current = { x: 0, y: 0 }
    }
    const cx = pos.current.x + CARD_W / 2
    const cy = pos.current.y + CARD_H / 2
    const dx = (lx - cx) / (CARD_W / 2)
    const dy = (ly - cy) / (CARD_H / 2)
    if (dx * dx + dy * dy < 4) {
      tiltTarget.current.rx = -dy * 12
      tiltTarget.current.ry = dx * 12
      setShinePct({
        x: ((lx - pos.current.x) / CARD_W) * 100,
        y: ((ly - pos.current.y) / CARD_H) * 100,
      })
    }
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    const wasDragging = didDrag.current
    dragging.current = false
    didDrag.current = false
    tiltTarget.current = { rx: 0, ry: 0 }
    document.body.style.cursor = 'auto'
    vel.current = { x: vel.current.x * 1.5, y: vel.current.y * 1.5 }
    if (!wasDragging) {
      triggerFlip()
    }
  }, [triggerFlip])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-visible"
      style={{ perspective: '1200px' }}
      onPointerMove={onPointerMove}
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 9999 }} />

      <div
        className="absolute pointer-events-none"
        style={{ left: 'calc(50% - 2px)', top: ANCHOR_Y - 4, width: 4, height: 8, background: '#444', borderRadius: 2, zIndex: 9999 }}
      />

      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 20, fontFamily: 'var(--font-mono)', fontSize: 10,
          letterSpacing: '0.2em', color: 'rgba(255,255,255,0.18)', whiteSpace: 'nowrap',
        }}
      >
        CLICK TO FLIP
      </div>

      <div
        ref={cardRef}
        className="absolute select-none"
        style={{
          width: CARD_W,
          height: CARD_H,
          willChange: 'transform',
          transformOrigin: 'top center',
          transformStyle: 'preserve-3d',
          zIndex: 9999,
          cursor: 'grab',
        }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={() => {
          if (!dragging.current) {
            document.body.style.cursor = 'auto'
            tiltTarget.current = { rx: 0, ry: 0 }
          }
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transform: `rotateY(${flipAngle}deg)`,
            boxShadow: '0 40px 100px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.06)',
            borderRadius: 16,
            transition: 'none',
          }}
        >
          <CardFront data={data} shinePct={shinePct} />
          <CardBack data={data} shinePct={shinePct} />
        </div>
      </div>
    </div>
  )
}