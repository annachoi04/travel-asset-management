"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { HeroCard } from "@/components/home/hero-card"
import { FlightProgress } from "@/components/home/flight-progress"
import { SavingsCard } from "@/components/home/savings-card"
import { DailyGuide } from "@/components/home/daily-guide"
import { TripSelector } from "@/components/home/trip-selector"
import { ChatInput } from "@/components/home/chat-input"
import { BottomNav } from "@/components/bottom-nav"
import { NewTripModal } from "@/components/home/new-trip-modal"
import { useTravelStore } from "@/lib/store"

export default function HomePage() {
  const router = useRouter()
  const { hasCompletedOnboarding, trips, currentTripId } = useTravelStore()
  const [isHydrated, setIsHydrated] = useState(false)
  const [showNewTripModal, setShowNewTripModal] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && !hasCompletedOnboarding) {
      router.push("/onboarding")
    }
  }, [isHydrated, hasCompletedOnboarding, router])

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

  if (!hasCompletedOnboarding) {
    return null
  }

  const currentTrip = trips.find((t) => t.id === currentTripId)

  if (!currentTrip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">아직 등록된 여행이 없어요</p>
          <button
            onClick={() => setShowNewTripModal(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold"
          >
            첫 번째 여행 추가하기
          </button>
        </div>
        <NewTripModal
          isOpen={showNewTripModal}
          onClose={() => setShowNewTripModal(false)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-40">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg px-4 py-3">
        <TripSelector onAddTrip={() => setShowNewTripModal(true)} />
      </header>

      {/* Content */}
      <main className="px-4 space-y-4">
        <HeroCard trip={currentTrip} />
        <FlightProgress trip={currentTrip} />
        <SavingsCard trip={currentTrip} />
        <DailyGuide trip={currentTrip} />
      </main>

      {/* Chat Input */}
      <ChatInput />

      {/* Bottom Navigation */}
      <BottomNav />

      {/* New Trip Modal */}
      <NewTripModal
        isOpen={showNewTripModal}
        onClose={() => setShowNewTripModal(false)}
      />
    </div>
  )
}
