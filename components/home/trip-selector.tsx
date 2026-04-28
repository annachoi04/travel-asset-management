"use client"

import { useState } from "react"
import { ChevronDown, Plus } from "lucide-react"
import { useTravelStore, countryData } from "@/lib/store"
import { cn } from "@/lib/utils"

interface TripSelectorProps {
  onAddTrip: () => void
}

export function TripSelector({ onAddTrip }: TripSelectorProps) {
  const { trips, currentTripId, setCurrentTripId } = useTravelStore()
  const [isOpen, setIsOpen] = useState(false)
  
  const currentTrip = trips.find((t) => t.id === currentTripId)

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-card rounded-xl border border-border"
        >
          <span className="text-xl">
            {currentTrip ? countryData[currentTrip.country]?.flag : "🌍"}
          </span>
          <span className="font-semibold text-foreground">
            {currentTrip?.name || "여행 선택"}
          </span>
          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
        </button>
        
        <button
          onClick={onAddTrip}
          className="p-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      
      {isOpen && trips.length > 1 && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-card rounded-xl shadow-lg border border-border overflow-hidden z-50">
          {trips.map((trip) => (
            <button
              key={trip.id}
              onClick={() => {
                setCurrentTripId(trip.id)
                setIsOpen(false)
              }}
              className={cn(
                "w-full px-4 py-3 flex items-center gap-3 hover:bg-accent transition-colors",
                trip.id === currentTripId && "bg-accent"
              )}
            >
              <span className="text-xl">{countryData[trip.country]?.flag}</span>
              <div className="text-left">
                <p className="font-medium text-foreground">{trip.name}</p>
                <p className="text-sm text-muted-foreground">{trip.city}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
