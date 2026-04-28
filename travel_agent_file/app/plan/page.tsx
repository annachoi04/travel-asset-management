"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronRight, ExternalLink, Plane, Building2, Utensils, Landmark, Wallet } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import {
  useTravelStore,
  formatCurrency,
  countryData,
  getTripDays,
  getMonthsUntil,
  getDaysUntil,
} from "@/lib/store"
import { cn } from "@/lib/utils"

export default function PlanPage() {
  const router = useRouter()
  const { hasCompletedOnboarding, trips, currentTripId, getSavingsCapacity } = useTravelStore()
  const [isHydrated, setIsHydrated] = useState(false)
  
  const [expandedFlight, setExpandedFlight] = useState(false)
  const [expandedAccommodation, setExpandedAccommodation] = useState(false)
  const [expandedAttractions, setExpandedAttractions] = useState(false)

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
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!hasCompletedOnboarding) return null

  const currentTrip = trips.find((t) => t.id === currentTripId)

  if (!currentTrip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 pb-20">
        <p className="text-muted-foreground">여행을 먼저 추가해주세요</p>
        <BottomNav />
      </div>
    )
  }

  const flag = countryData[currentTrip.country]?.flag || "🌍"
  const days = getTripDays(currentTrip.startDate, currentTrip.endDate)
  const nights = days - 1
  const months = getMonthsUntil(currentTrip.startDate)
  const savingsCapacity = getSavingsCapacity()
  const requiredMonthlySavings = Math.ceil(currentTrip.budget.total / months)
  const canAchieve = requiredMonthlySavings <= savingsCapacity
  const dailyBudget = Math.floor(
    (currentTrip.budget.food + currentTrip.budget.attractions + currentTrip.budget.others) / days / currentTrip.people
  )

  const handleAdjust = () => {
    router.push("/chat?action=adjust")
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{flag}</span>
          <h1 className="text-xl font-bold text-foreground">
            {currentTrip.city} 여행 계획 🗺️
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {currentTrip.name} · {currentTrip.people}명 · {days}일 ({nights}박)
        </p>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Pre-travel Expenses */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            여행 전 경비
          </h2>
          
          <div className="bg-card rounded-2xl overflow-hidden divide-y divide-border">
            {/* Flight */}
            <div className="p-4">
              <button
                onClick={() => setExpandedFlight(!expandedFlight)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Plane className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-medium text-foreground">항공권</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">
                    {formatCurrency(currentTrip.budget.flight)}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform",
                      expandedFlight && "rotate-180"
                    )}
                  />
                </div>
              </button>
              
              {expandedFlight && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">출발지</span>
                    <span className="text-foreground">인천국제공항</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">도착지</span>
                    <span className="text-foreground">{currentTrip.city}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">날짜</span>
                    <span className="text-foreground">
                      {currentTrip.startDate} ~ {currentTrip.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">인원</span>
                    <span className="text-foreground">{currentTrip.people}명</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    * 평균 왕복 항공권 가격 기준 추정치
                  </p>
                  <a
                    href={`https://www.google.com/travel/flights?q=인천+${currentTrip.city}+항공권`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    항공권 검색하기
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Accommodation */}
            <div className="p-4">
              <button
                onClick={() => setExpandedAccommodation(!expandedAccommodation)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-medium text-foreground">숙박</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">
                    {formatCurrency(currentTrip.budget.accommodation)}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform",
                      expandedAccommodation && "rotate-180"
                    )}
                  />
                </div>
              </button>
              
              {expandedAccommodation && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">숙박 유형</span>
                    <span className="text-foreground">{currentTrip.style.accommodationType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">기간</span>
                    <span className="text-foreground">{nights}박</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">1박 예상가</span>
                    <span className="text-foreground">
                      {formatCurrency(Math.round(currentTrip.budget.accommodation / nights))}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    * {currentTrip.style.accommodationType} 기준 평균가 추정
                  </p>
                  <a
                    href={`https://www.booking.com/searchresults.ko.html?ss=${encodeURIComponent(currentTrip.city)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    숙소 검색하기
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* During Travel Expenses */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            여행 중 경비
          </h2>
          
          <div className="bg-card rounded-2xl overflow-hidden divide-y divide-border">
            {/* Food */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <span className="font-medium text-foreground">식비</span>
                    <p className="text-xs text-muted-foreground">
                      하루 {formatCurrency(Math.round(currentTrip.budget.food / days / currentTrip.people))} / 인
                    </p>
                  </div>
                </div>
                <span className="font-bold text-foreground">
                  {formatCurrency(currentTrip.budget.food)}
                </span>
              </div>
            </div>

            {/* Attractions */}
            <div className="p-4">
              <button
                onClick={() => setExpandedAttractions(!expandedAttractions)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Landmark className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-medium text-foreground">관광지</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">
                    {formatCurrency(currentTrip.budget.attractions)}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform",
                      expandedAttractions && "rotate-180"
                    )}
                  />
                </div>
              </button>
              
              {expandedAttractions && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <p className="text-sm text-muted-foreground">
                    선택한 여행 스타일: {currentTrip.style.travelStyles.join(", ")}
                  </p>
                  {currentTrip.style.mustVisit && (
                    <p className="text-sm text-foreground">
                      꼭 가고 싶은 곳: {currentTrip.style.mustVisit}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    * 주요 명소 입장료 합산 기준 추정치
                  </p>
                  <a
                    href={`https://www.tripadvisor.co.kr/Search?q=${encodeURIComponent(currentTrip.city)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    관광지 정보 보기
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Others */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <span className="font-medium text-foreground">기타</span>
                    <p className="text-xs text-muted-foreground">교통비, 쇼핑, 여유 비용</p>
                  </div>
                </div>
                <span className="font-bold text-foreground">
                  {formatCurrency(currentTrip.budget.others)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Daily Budget */}
        <div className="bg-accent rounded-2xl p-5">
          <p className="text-muted-foreground mb-1">하루 예산</p>
          <p className="text-2xl font-bold text-accent-foreground">
            {formatCurrency(dailyBudget)} <span className="text-lg font-normal">/ 인</span>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            식비 + 관광 + 기타를 {days}일로 나눈 금액이에요
          </p>
        </div>

        {/* Savings Analysis */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            저축 계획 분석
          </h2>
          
          <div className="bg-card rounded-2xl p-5 space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">월별 필요 저축액</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(requiredMonthlySavings)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">현재 월 저축 가능액</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(savingsCapacity)}
              </span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">달성 가능 여부</span>
              <span className={cn(
                "font-semibold",
                canAchieve ? "text-primary" : "text-destructive"
              )}>
                {canAchieve ? "✅ 달성 가능" : "⚠️ 조정 필요"}
              </span>
            </div>
            {!canAchieve && (
              <p className="text-sm text-muted-foreground">
                월 {formatCurrency(requiredMonthlySavings - savingsCapacity)}이 부족해요.
                일정이나 예산을 조정해보세요.
              </p>
            )}
          </div>
        </section>

        {/* Adjust Button */}
        <button
          onClick={handleAdjust}
          className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-semibold flex items-center justify-center gap-2"
        >
          조정 요청하기
          <ChevronRight className="w-5 h-5" />
        </button>
      </main>

      <BottomNav />
    </div>
  )
}
