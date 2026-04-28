"use client"

import { formatCurrency, getDaysUntil, useTravelStore } from "@/lib/store"
import type { Trip } from "@/lib/store"

interface DailyGuideProps {
  trip: Trip
}

export function DailyGuide({ trip }: DailyGuideProps) {
  const { getSavingsCapacity } = useTravelStore()
  const savingsCapacity = getSavingsCapacity()
  
  const daysUntil = getDaysUntil(trip.startDate)
  const remaining = trip.budget.total - trip.currentSavings
  const daysInMonth = 30
  
  // Calculate daily available spending
  // Total monthly income - monthly savings needed = available for spending
  const monthlySavingsNeeded = daysUntil > 0 ? remaining / (daysUntil / 30) : 0
  const monthlySpendable = savingsCapacity - Math.min(monthlySavingsNeeded, savingsCapacity)
  const dailySpendable = Math.max(0, Math.floor(monthlySpendable / daysInMonth))
  
  // Check if on track
  const isOnTrack = monthlySavingsNeeded <= savingsCapacity

  return (
    <div className="bg-card rounded-2xl p-5">
      <h3 className="text-lg font-semibold text-foreground mb-4">오늘의 소비 가이드</h3>
      
      <div className="bg-accent rounded-xl p-4 mb-4">
        <p className="text-muted-foreground mb-1">오늘 쓸 수 있는 돈</p>
        <p className="text-3xl font-bold text-accent-foreground">
          {formatCurrency(dailySpendable)}
        </p>
      </div>
      
      <div className={`flex items-start gap-3 ${isOnTrack ? "text-primary" : "text-amber-500"}`}>
        <span className="text-xl">{isOnTrack ? "✅" : "⚠️"}</span>
        <p className="text-sm leading-relaxed">
          {isOnTrack 
            ? `이 페이스면 ${trip.city}까지 예정대로 도착해요`
            : `조금 더 절약하면 ${trip.city}에 도착할 수 있어요`
          }
        </p>
      </div>
    </div>
  )
}
