"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useTravelStore } from "@/lib/store"

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { hasCompletedOnboarding } = useTravelStore()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    
    // If not completed onboarding and not on onboarding page, redirect
    if (!hasCompletedOnboarding && pathname !== "/onboarding") {
      router.push("/onboarding")
    }
    
    // If completed onboarding and on onboarding page, redirect to home
    if (hasCompletedOnboarding && pathname === "/onboarding") {
      router.push("/")
    }
  }, [isHydrated, hasCompletedOnboarding, pathname, router])

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
