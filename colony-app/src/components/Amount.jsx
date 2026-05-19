// Amount — render a numeric MOND value with the Ɱ symbol leading.
//
// Usage:
//   <Amount value={123} />               → Ɱ 123
//   <Amount value={'12.50'} size={14} /> → Ɱ 12.50 (heavier stroke at smaller sizes)
//   <Amount value={`+${n}`} color={C.green} /> → custom prefix + colour
//
// The symbol inherits color from the parent element (currentColor) unless
// `color` is passed explicitly. Stroke weight auto-scales by size — see
// MondSymbol.
import MondSymbol from './MondSymbol'

export default function Amount({ value, size = 12, color, suffix, style }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 3,
        color,
        ...style,
      }}
    >
      <MondSymbol size={size} color={color} />
      {value}
      {suffix && <span style={{ marginLeft: 2 }}>{suffix}</span>}
    </span>
  )
}
