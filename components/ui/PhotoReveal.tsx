import type { ReactNode } from 'react'
import Image from 'next/image'

interface PhotoRevealProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  children?: ReactNode
}

export function PhotoReveal({
  src,
  alt,
  width,
  height,
  fill,
  className,
  children,
}: PhotoRevealProps) {
  return (
    <div className={`group relative overflow-hidden ${className ?? ''}`}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : (width ?? 600)}
        height={fill ? undefined : (height ?? 400)}
        fill={fill}
        className="photo-dark object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      {children}
    </div>
  )
}
