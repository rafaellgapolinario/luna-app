'use client'
export function NexusIcon({ size = 36 }: { size?: number }) {
  return (
    <img
      src="/luna-logo.png"
      alt="LUNA"
      width={size}
      height={size}
      style={{ objectFit: 'contain', borderRadius: '50%' }}
    />
  )
}
// Alias para compatibilidade
export { NexusIcon as NexusIcon }
