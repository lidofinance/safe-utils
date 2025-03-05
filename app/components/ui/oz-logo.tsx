"use client"

import { useTheme } from "next-themes"
import Image from "next/image"
import { useEffect, useState } from "react"

export function OZLogo() {
  const { resolvedTheme } = useTheme()
  return (
    <Image
      src={`${process.env.NEXT_PUBLIC_BASE_PATH || '.'}/OZ-Logo-${resolvedTheme === 'dark' ? 'White' : 'Black'}.svg`}
      alt="OpenZeppelin Logo"
      width={200}
      height={40}
      style={{ 
        width: '200px', 
        height: '40px',
        objectFit: 'contain'
      }}
      priority
    />
  )
}