"use client"

import Image from "next/image"

interface CloudinaryImageProps {
  src: string
  alt: string
  width: number
  height: number
  crop?: string
  className?: string
}

export function CloudinaryImage({ src, alt, width, height, crop = "fill", className = "" }: CloudinaryImageProps) {
  // If it's a placeholder or external URL, use it directly
  if (src.startsWith("/placeholder") || src.startsWith("http")) {
    return <Image src={src || "/placeholder.svg"} alt={alt} width={width} height={height} className={className} />
  }

  // Construct Cloudinary URL manually
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloudName) {
    return <Image src="/placeholder.svg" alt={alt} width={width} height={height} className={className} />
  }

  const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/upload/c_${crop},w_${width},h_${height},q_auto,f_auto/${src}`

  return (
    <Image src={cloudinaryUrl || "/placeholder.svg"} alt={alt} width={width} height={height} className={className} />
  )
}
