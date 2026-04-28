"use client"

import { countryData, getDaysUntil, getEmotionalCopy } from "@/lib/store"
import type { Trip } from "@/lib/store"

interface HeroCardProps {
  trip: Trip
}

export function HeroCard({ trip }: HeroCardProps) {
  const flag = countryData[trip.country]?.flag || "🌍"
  const daysUntil = getDaysUntil(trip.startDate)
  const progress = Math.min(100, (trip.currentSavings / trip.budget.total) * 100)
  const emotionalCopy = getEmotionalCopy(trip.city, progress)

  // Generate gradient based on destination
  const getGradient = () => {
    const gradients: Record<string, string> = {
      "프랑스": "from-blue-400 to-indigo-500",
      "일본": "from-pink-400 to-rose-500",
      "미국": "from-blue-500 to-red-400",
      "이탈리아": "from-green-400 to-red-400",
      "영국": "from-red-400 to-blue-500",
      "스페인": "from-yellow-400 to-red-500",
      "태국": "from-blue-400 to-orange-400",
      "베트남": "from-yellow-400 to-red-500",
      "호주": "from-blue-400 to-yellow-400",
      "독일": "from-gray-700 to-yellow-400",
      "스위스": "from-red-400 to-white",
      "그리스": "from-blue-400 to-white",
      "포르투갈": "from-green-400 to-red-500",
      "터키": "from-red-400 to-white",
      "체코": "from-blue-400 to-red-400",
    }
    return gradients[trip.country] || "from-teal-400 to-cyan-500"
  }

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${getGradient()} p-6 text-white`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{flag}</span>
          <span className="px-2 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
            D-{daysUntil > 0 ? daysUntil : 0}
          </span>
        </div>
        
        <h2 className="text-3xl font-bold mb-2">{trip.city}</h2>
        <p className="text-white/90 text-lg">{emotionalCopy} 🌊</p>
      </div>
    </div>
  )
}
