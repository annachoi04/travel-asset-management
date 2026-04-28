"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { TravelStyle } from "@/lib/store"
import { cn } from "@/lib/utils"

interface TravelStyleStepProps {
  style: TravelStyle
  onUpdate: (style: TravelStyle) => void
  onNext: () => void
  onBack: () => void
}

const travelStyleOptions = [
  { id: "휴양", label: "휴양", emoji: "🏖️" },
  { id: "맛집 탐방", label: "맛집 탐방", emoji: "🍜" },
  { id: "문화·역사", label: "문화·역사", emoji: "🏛️" },
  { id: "쇼핑", label: "쇼핑", emoji: "🛍️" },
  { id: "액티비티", label: "액티비티", emoji: "🧗" },
]

const accommodationOptions = [
  { id: "호텔", label: "호텔", emoji: "🏨" },
  { id: "에어비앤비", label: "에어비앤비", emoji: "🏠" },
  { id: "호스텔", label: "호스텔", emoji: "🛏️" },
]

const scheduleOptions = [
  { id: "빡빡하게", label: "빡빡하게", emoji: "🔥" },
  { id: "여유롭게", label: "여유롭게", emoji: "☁️" },
  { id: "중간", label: "중간", emoji: "😊" },
]

const foodOptions = [
  { id: "현지 맛집 위주", label: "현지 맛집 위주", emoji: "⭐" },
  { id: "적당히", label: "적당히", emoji: "👌" },
  { id: "최대한 절약", label: "최대한 절약", emoji: "💰" },
]

export function TravelStyleStep({
  style,
  onUpdate,
  onNext,
  onBack,
}: TravelStyleStepProps) {
  const [localStyles, setLocalStyles] = useState<string[]>(style.travelStyles || [])
  const [localAccommodation, setLocalAccommodation] = useState(style.accommodationType || "")
  const [localSchedule, setLocalSchedule] = useState(style.scheduleIntensity || "")
  const [localFood, setLocalFood] = useState(style.foodPriority || "")
  const [localMustVisit, setLocalMustVisit] = useState(style.mustVisit || "")
  const [localAvoid, setLocalAvoid] = useState(style.avoidPlaces || "")

  const toggleTravelStyle = (id: string) => {
    if (localStyles.includes(id)) {
      setLocalStyles(localStyles.filter((s) => s !== id))
    } else {
      setLocalStyles([...localStyles, id])
    }
  }

  const handleNext = () => {
    onUpdate({
      travelStyles: localStyles,
      accommodationType: localAccommodation,
      scheduleIntensity: localSchedule,
      foodPriority: localFood,
      mustVisit: localMustVisit,
      avoidPlaces: localAvoid,
    })
    onNext()
  }

  const isValid =
    localStyles.length > 0 &&
    localAccommodation &&
    localSchedule &&
    localFood

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 px-5 pt-12 pb-32 overflow-y-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          어떤 여행을 원하세요? ✨
        </h1>
        <p className="text-muted-foreground mb-8">
          입력하신 정보를 바탕으로 맞춤 계획을 세워드려요
        </p>

        {/* Travel Style */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            여행 스타일 <span className="text-sm font-normal text-muted-foreground">(1개 이상 선택)</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {travelStyleOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleTravelStyle(option.id)}
                className={cn(
                  "px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2",
                  localStyles.includes(option.id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-input text-foreground hover:bg-accent"
                )}
              >
                <span>{option.emoji}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Accommodation Style */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            숙박 스타일 <span className="text-sm font-normal text-muted-foreground">(1개 선택)</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {accommodationOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setLocalAccommodation(option.id)}
                className={cn(
                  "px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2",
                  localAccommodation === option.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-input text-foreground hover:bg-accent"
                )}
              >
                <span>{option.emoji}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Schedule Intensity */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            하루 일정 밀도 <span className="text-sm font-normal text-muted-foreground">(1개 선택)</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {scheduleOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setLocalSchedule(option.id)}
                className={cn(
                  "px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2",
                  localSchedule === option.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-input text-foreground hover:bg-accent"
                )}
              >
                <span>{option.emoji}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Food Priority */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            식비 우선순위 <span className="text-sm font-normal text-muted-foreground">(1개 선택)</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {foodOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setLocalFood(option.id)}
                className={cn(
                  "px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2",
                  localFood === option.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-input text-foreground hover:bg-accent"
                )}
              >
                <span>{option.emoji}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Must Visit */}
        <section className="mb-6">
          <label className="block text-lg font-semibold text-foreground mb-2">
            꼭 가고 싶은 곳이 있나요?
          </label>
          <p className="text-sm text-muted-foreground mb-3">
            예: 루브르 박물관, 에펠탑 야경
          </p>
          <input
            type="text"
            value={localMustVisit}
            onChange={(e) => setLocalMustVisit(e.target.value)}
            placeholder="장소를 입력해주세요 (선택)"
            className="w-full h-14 px-4 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </section>

        {/* Avoid Places */}
        <section className="mb-6">
          <label className="block text-lg font-semibold text-foreground mb-2">
            피하고 싶은 것이 있나요?
          </label>
          <p className="text-sm text-muted-foreground mb-3">
            예: 줄 서는 곳, 실내 관광지
          </p>
          <input
            type="text"
            value={localAvoid}
            onChange={(e) => setLocalAvoid(e.target.value)}
            placeholder="피하고 싶은 것을 입력해주세요 (선택)"
            className="w-full h-14 px-4 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </section>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-background border-t border-border">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 h-14 text-lg font-semibold rounded-2xl"
          >
            이전
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isValid}
            className="flex-1 h-14 text-lg font-semibold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  )
}
