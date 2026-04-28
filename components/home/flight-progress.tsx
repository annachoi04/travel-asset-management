"use client"

import { countryData, getEmotionalCopy } from "@/lib/store"
import type { Trip } from "@/lib/store"

interface FlightProgressProps {
  trip: Trip
}

export function FlightProgress({ trip }: FlightProgressProps) {
  const flag = countryData[trip.country]?.flag || "🌍"
  const progress = Math.min(100, (trip.currentSavings / trip.budget.total) * 100)

  return (
    <div className="bg-card rounded-2xl p-5">
      <div className="relative mb-4">
        {/* Track */}
        <div className="h-2 bg-muted rounded-full" />
        
        {/* Progress */}
        <div
          className="absolute top-0 left-0 h-2 bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
        
        {/* Airplane */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-500"
          style={{ left: `calc(${progress}% - 12px)` }}
        >
          <span className="text-2xl">✈️</span>
        </div>
      </div>
      
      {/* Labels */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xl">🇰🇷</span>
        <span className="text-xl">{flag}</span>
      </div>
      
      {/* Emotional copy */}
      <p className="text-center text-muted-foreground">
        {getEmotionalCopy(trip.city, progress)}... <span className="font-semibold text-primary">{progress.toFixed(0)}%</span> 왔어요
      </p>
    </div>
  )
}
