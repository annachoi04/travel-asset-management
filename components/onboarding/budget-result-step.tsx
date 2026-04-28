"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight, ExternalLink, Info } from "lucide-react"
import {
  type TravelBudget,
  type TravelStyle,
  formatCurrency,
  countryData,
  getMonthsUntil,
} from "@/lib/store"

interface BudgetResultStepProps {
  tripName: string
  country: string
  city: string
  startDate: string
  endDate: string
  people: number
  style: TravelStyle
  budget: TravelBudget
  monthlySavingsCapacity: number
  initialSavings: number
  onConfirm: () => void
  onAdjust: () => void
  onBack: () => void
}

export function BudgetResultStep({
  tripName,
  country,
  city,
  startDate,
  endDate,
  people,
  style,
  budget,
  monthlySavingsCapacity,
  initialSavings,
  onConfirm,
  onAdjust,
  onBack,
}: BudgetResultStepProps) {
  const flag = countryData[country]?.flag || "🌍"
  const months = getMonthsUntil(startDate)
  const remainingAmount = Math.max(0, budget.total - initialSavings)
  const requiredMonthlySavings = months > 0 ? Math.ceil(remainingAmount / months) : remainingAmount
  const canAchieve = requiredMonthlySavings <= monthlySavingsCapacity
  
  // Calculate target completion date
  const getTargetDate = () => {
    if (requiredMonthlySavings <= 0) return null
    const targetDate = new Date()
    const monthsNeeded = monthlySavingsCapacity > 0 
      ? Math.ceil(remainingAmount / monthlySavingsCapacity)
      : months
    targetDate.setMonth(targetDate.getMonth() + monthsNeeded)
    return targetDate.toLocaleDateString("ko-KR", { year: "numeric", month: "long" })
  }

  const days =
    Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1

  const getAccommodationDesc = () => {
    const typeMap: Record<string, string> = {
      호텔: "호텔",
      에어비앤비: "에어비앤비",
      호스텔: "호스텔",
    }
    return `${typeMap[style.accommodationType] || "숙소"} ${days - 1}박`
  }

  const getFoodDesc = () => {
    const styleDesc =
      style.foodPriority === "현지 맛집 위주"
        ? "맛집 탐방 스타일 반영"
        : style.foodPriority === "최대한 절약"
          ? "절약 스타일 반영"
          : "기본 예산"
    return `하루 3끼 × ${days}일 / ${styleDesc}`
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 px-5 pt-12 pb-40 overflow-y-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {flag} {city} 여행, 이렇게 준비해요 🗺️
        </h1>
        <p className="text-muted-foreground mb-8">
          {tripName} · {people}명 · {days}일
        </p>

        {/* Pre-travel Expenses */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            여행 전 경비
          </h2>
          
          <div className="bg-card rounded-2xl divide-y divide-border overflow-hidden">
            {/* Flight */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-foreground">항공권</span>
                <span className="font-bold text-foreground">
                  {formatCurrency(budget.flight)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                인천-{city} 왕복 평균가 기준 × {people}명
              </p>
              <a
                href={`https://www.google.com/travel/flights?q=인천+${city}+항공권`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                실제 가격 확인하기
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Accommodation */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-foreground">숙박</span>
                <span className="font-bold text-foreground">
                  {formatCurrency(budget.accommodation)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {getAccommodationDesc()}
              </p>
              <a
                href={`https://www.booking.com/searchresults.ko.html?ss=${encodeURIComponent(city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                실제 가격 확인하기
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </section>

        {/* During Travel Expenses */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            여행 중 경비
          </h2>
          
          <div className="bg-card rounded-2xl divide-y divide-border overflow-hidden">
            {/* Food */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-foreground">식비</span>
                <span className="font-bold text-foreground">
                  {formatCurrency(budget.food)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {getFoodDesc()}
              </p>
            </div>

            {/* Attractions */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-foreground">관광지</span>
                <span className="font-bold text-foreground">
                  {formatCurrency(budget.attractions)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                주요 명소 입장료 합산 기준
              </p>
              <a
                href={`https://www.tripadvisor.co.kr/Search?q=${encodeURIComponent(city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                명소 정보 확인하기
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Others */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-foreground">기타</span>
                <span className="font-bold text-foreground">
                  {formatCurrency(budget.others)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                교통비, 쇼핑, 여유 비용
              </p>
            </div>
          </div>
        </section>

        {/* Total & Monthly Savings */}
        <section className="mb-6">
          <div className="bg-primary/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium text-foreground">총 예상 경비</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(budget.total)}
              </span>
            </div>
            
            <div className="h-px bg-primary/20 mb-4" />
            
            <div className={`flex items-start gap-3 ${canAchieve ? "text-primary" : "text-destructive"}`}>
              <div className="mt-0.5">
                {canAchieve ? "✅" : "⚠️"}
              </div>
              <div>
                {initialSavings > 0 ? (
                  <>
                    <p className="font-semibold">
                      현재 {formatCurrency(initialSavings)} 모았고, 매달 {formatCurrency(requiredMonthlySavings)}씩 추가하면 {getTargetDate()}까지 목표 달성 가능해요 🎉
                    </p>
                    <p className="text-sm mt-1 opacity-80">
                      남은 금액: {formatCurrency(remainingAmount)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">
                      매달 {formatCurrency(requiredMonthlySavings)}씩 모으면 딱 맞아요
                    </p>
                    <p className="text-sm mt-1 opacity-80">
                      {months}개월 동안 저축하면 목표 달성!
                    </p>
                  </>
                )}
                {!canAchieve && (
                  <p className="text-sm mt-2">
                    현재 월 저축 가능액 {formatCurrency(monthlySavingsCapacity)}보다 많아요.
                    일정이나 예산을 조정해보세요.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="bg-muted rounded-2xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            위 금액은 평균 데이터 기반 추정치예요. 실제 예약 시 가격이 다를 수 있어요.
            에이전트에게 &apos;항공권 가격 업데이트해줘&apos;라고 말하면 최신 정보로 다시 계산해드려요 ✈️
          </p>
        </div>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-background border-t border-border">
        <div className="flex gap-3 mb-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 h-14 text-lg font-semibold rounded-2xl"
          >
            이전
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 h-14 text-lg font-semibold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            확인하기
          </Button>
        </div>
        <button
          onClick={onAdjust}
          className="w-full h-12 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>조정 요청하기</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
