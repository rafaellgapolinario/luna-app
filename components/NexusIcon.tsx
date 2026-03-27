import React from 'react'

export default function NexusIcon({ size = 40 }: { size?: number }) {
  return (
    <img
      src="/luna-logo.png"
      alt="LUNA"
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        borderRadius: '50%',
      }}
    />
  )
}