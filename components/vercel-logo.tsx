/**
 * Official Vercel brand assets.
 * Source: https://vercel.com/geist/brands
 *
 * - VercelMark:     the triangle symbol only (1155 x 1000)
 * - VercelWordmark: triangle + "Vercel" wordmark, per brand guidelines
 */

type Props = {
  height?: number
  color?: string
  className?: string
  style?: React.CSSProperties
}

// Official Vercel triangle mark. Native aspect ratio 1155:1000.
export function VercelMark({ height = 16, color = 'currentColor', className, style }: Props) {
  const width = (height * 1155) / 1000
  return (
    <svg
      aria-label="Vercel"
      height={height}
      width={width}
      viewBox="0 0 1155 1000"
      fill="none"
      className={className}
      style={style}
    >
      <path d="m577.3 0 577.4 1000H0z" fill={color} />
    </svg>
  )
}

/**
 * Vercel wordmark: triangle mark + "Vercel" text set in Geist Sans.
 * Sized by `height` (defaults to 16px wordmark height).
 * The mark is ~78% of the cap height per brand spec.
 */
export function VercelWordmark({ height = 16, color = 'currentColor', className, style }: Props) {
  const markHeight = Math.round(height * 0.8)
  const gap = Math.round(height * 0.38)
  return (
    <span
      aria-label="Vercel"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap,
        color,
        lineHeight: 1,
        ...style,
      }}
    >
      <VercelMark height={markHeight} color={color} />
      <span
        style={{
          fontFamily: 'var(--font-sans), "Geist", system-ui, -apple-system, sans-serif',
          fontSize: height,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          color,
        }}
      >
        Vercel
      </span>
    </span>
  )
}
