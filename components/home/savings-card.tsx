"use client"

import { formatCurrency } from "@/lib/store"
import type { Trip } from "@/lib/store"

interface SavingsCardProps {
  trip: Trip
}

export function SavingsCard({ trip }: SavingsCardProps) {
  const progress = Math.min(100, (trip.currentSavings / trip.budget.total) * 100)
  const remaining = trip.budget.total - trip.currentSavings
  
  // Calculate circle properties
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="bg-card rounded-2xl p-5">
      <h3 className="text-lg font-semibold text-foreground mb-4">저축 현황</h3>
      
      <div className="flex items-center gap-6">
        {/* Circular Progress */}
        <div className="relative flex-shrink-0">
          <svg width="140" height="140" className="-rotate-90">
            {/* Background circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-muted"
            />
            {/* Progress circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="text-primary transition-all duration-500"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-foreground">
              {progress.toFixed(0)}%
            </span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">현재 저축액</p>
            <p className="text-xl font-bold text-primary">
              {formatCurrency(trip.currentSavings)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">목표 금액</p>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(trip.budget.total)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">남은 금액</p>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(Math.max(0, remaining))}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
