"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface IncomeItem {
  id: string
  name: string
  amount: number
}

export interface ExpenseItem {
  id: string
  name: string
  amount: number
}

export interface TravelStyle {
  travelStyles: string[]
  accommodationType: string
  scheduleIntensity: string
  foodPriority: string
  mustVisit: string
  avoidPlaces: string
}

export interface TravelBudget {
  flight: number
  accommodation: number
  food: number
  attractions: number
  others: number
  total: number
  monthlySavings: number
}

export interface Trip {
  id: string
  name: string
  country: string
  city: string
  startDate: string
  endDate: string
  people: number
  style: TravelStyle
  budget: TravelBudget
  currentSavings: number
  createdAt: string
}

export interface FinancialInfo {
  incomes: IncomeItem[]
  fixedExpenses: ExpenseItem[]
  livingExpense: number
  initialSavings: number
}

interface TravelStore {
  hasCompletedOnboarding: boolean
  financialInfo: FinancialInfo
  trips: Trip[]
  currentTripId: string | null
  
  setHasCompletedOnboarding: (value: boolean) => void
  setFinancialInfo: (info: FinancialInfo) => void
  addTrip: (trip: Trip) => void
  updateTrip: (id: string, trip: Partial<Trip>) => void
  deleteTrip: (id: string) => void
  setCurrentTripId: (id: string | null) => void
  updateCurrentSavings: (tripId: string, amount: number) => void
  getCurrentTrip: () => Trip | undefined
  getSavingsCapacity: () => number
}

export const useTravelStore = create<TravelStore>()(
  persist(
    (set, get) => ({
      hasCompletedOnboarding: false,
      financialInfo: {
        incomes: [],
        fixedExpenses: [],
        livingExpense: 0,
        initialSavings: 0,
      },
      trips: [],
      currentTripId: null,

      setHasCompletedOnboarding: (value) => set({ hasCompletedOnboarding: value }),
      
      setFinancialInfo: (info) => set({ financialInfo: info }),
      
      addTrip: (trip) => set((state) => ({ 
        trips: [...state.trips, trip],
        currentTripId: trip.id 
      })),
      
      updateTrip: (id, updates) => set((state) => ({
        trips: state.trips.map((trip) => 
          trip.id === id ? { ...trip, ...updates } : trip
        )
      })),
      
      deleteTrip: (id) => set((state) => ({
        trips: state.trips.filter((trip) => trip.id !== id),
        currentTripId: state.currentTripId === id 
          ? state.trips.find((t) => t.id !== id)?.id || null 
          : state.currentTripId
      })),
      
      setCurrentTripId: (id) => set({ currentTripId: id }),
      
      updateCurrentSavings: (tripId, amount) => set((state) => ({
        trips: state.trips.map((trip) =>
          trip.id === tripId 
            ? { ...trip, currentSavings: trip.currentSavings + amount }
            : trip
        )
      })),
      
      getCurrentTrip: () => {
        const state = get()
        return state.trips.find((trip) => trip.id === state.currentTripId)
      },
      
      getSavingsCapacity: () => {
        const { financialInfo } = get()
        const totalIncome = financialInfo.incomes.reduce((sum, i) => sum + i.amount, 0)
        const totalExpenses = financialInfo.fixedExpenses.reduce((sum, e) => sum + e.amount, 0)
        return totalIncome - totalExpenses - financialInfo.livingExpense
      }
    }),
    {
      name: "travel-store",
    }
  )
)

// Country and City Data
export const countryData: Record<string, { flag: string; cities: string[] }> = {
  "프랑스": { flag: "🇫🇷", cities: ["파리", "니스", "마르세유", "리옹", "보르도", "스트라스부르"] },
  "일본": { flag: "🇯🇵", cities: ["도쿄", "오사카", "교토", "후쿠오카", "삿포로", "오키나와"] },
  "미국": { flag: "🇺🇸", cities: ["뉴욕", "로스앤젤레스", "샌프란시스코", "라스베가스", "하와이", "시애틀"] },
  "이탈리아": { flag: "🇮🇹", cities: ["로마", "밀라노", "베네치아", "피렌체", "나폴리", "아말피"] },
  "영국": { flag: "🇬🇧", cities: ["런던", "맨체스터", "에든버러", "리버풀", "옥스퍼드", "캠브리지"] },
  "스페인": { flag: "🇪🇸", cities: ["바르셀로나", "마드리드", "세비야", "발렌시아", "그라나다", "말라가"] },
  "태국": { flag: "🇹🇭", cities: ["방콕", "치앙마이", "푸켓", "파타야", "끄라비", "코사무이"] },
  "베트남": { flag: "🇻🇳", cities: ["호치민", "하노이", "다낭", "나트랑", "호이안", "푸꾸옥"] },
  "호주": { flag: "🇦🇺", cities: ["시드니", "멜버른", "브리즈번", "퍼스", "골드코스트", "케언즈"] },
  "독일": { flag: "🇩🇪", cities: ["베를린", "뮌헨", "프랑크푸르트", "함부르크", "쾰른", "드레스덴"] },
  "스위스": { flag: "🇨🇭", cities: ["취리히", "제네바", "인터라켄", "루체른", "베른", "체르마트"] },
  "그리스": { flag: "🇬🇷", cities: ["아테네", "산토리니", "미코노스", "크레타", "로도스", "코르푸"] },
  "포르투갈": { flag: "🇵🇹", cities: ["리스본", "포르투", "신트라", "파로", "코임브라", "마데이라"] },
  "터키": { flag: "🇹🇷", cities: ["이스탄불", "카파도키아", "안탈리아", "이즈미르", "보드룸", "파묵칼레"] },
  "체코": { flag: "🇨🇿", cities: ["프라하", "체스키크룸로프", "브르노", "카를로비바리", "플젠", "올로모우츠"] },
}

// Budget calculation based on style
export function calculateBudget(
  country: string,
  city: string,
  days: number,
  people: number,
  style: TravelStyle
): TravelBudget {
  // Base prices per destination (average in KRW)
  const destinationPrices: Record<string, { flight: number; hotel: number; meal: number; attraction: number }> = {
    "프랑스": { flight: 1200000, hotel: 200000, meal: 40000, attraction: 20000 },
    "일본": { flight: 400000, hotel: 150000, meal: 25000, attraction: 15000 },
    "미국": { flight: 1500000, hotel: 250000, meal: 45000, attraction: 25000 },
    "이탈리아": { flight: 1100000, hotel: 180000, meal: 35000, attraction: 20000 },
    "영국": { flight: 1000000, hotel: 220000, meal: 40000, attraction: 22000 },
    "스페인": { flight: 1000000, hotel: 150000, meal: 30000, attraction: 18000 },
    "태국": { flight: 350000, hotel: 80000, meal: 15000, attraction: 10000 },
    "베트남": { flight: 300000, hotel: 60000, meal: 10000, attraction: 8000 },
    "호주": { flight: 1300000, hotel: 200000, meal: 40000, attraction: 25000 },
    "독일": { flight: 1000000, hotel: 180000, meal: 35000, attraction: 18000 },
    "스위스": { flight: 1200000, hotel: 300000, meal: 50000, attraction: 30000 },
    "그리스": { flight: 1100000, hotel: 150000, meal: 30000, attraction: 20000 },
    "포르투갈": { flight: 1100000, hotel: 140000, meal: 28000, attraction: 15000 },
    "터키": { flight: 800000, hotel: 100000, meal: 20000, attraction: 15000 },
    "체코": { flight: 900000, hotel: 120000, meal: 25000, attraction: 12000 },
  }
  
  const prices = destinationPrices[country] || destinationPrices["일본"]
  
  // Accommodation multiplier based on style
  let hotelMultiplier = 1
  if (style.accommodationType === "호텔") hotelMultiplier = 1.3
  else if (style.accommodationType === "에어비앤비") hotelMultiplier = 0.8
  else if (style.accommodationType === "호스텔") hotelMultiplier = 0.4
  
  // Relaxation style = better accommodation
  if (style.travelStyles.includes("휴양")) hotelMultiplier *= 1.2
  
  // Food multiplier based on style
  let foodMultiplier = 1
  if (style.foodPriority === "현지 맛집 위주") foodMultiplier = 1.5
  else if (style.foodPriority === "적당히") foodMultiplier = 1
  else if (style.foodPriority === "최대한 절약") foodMultiplier = 0.6
  
  // Tasting tour = higher food budget
  if (style.travelStyles.includes("맛집 탐방")) foodMultiplier *= 1.3
  
  // Attraction multiplier
  let attractionMultiplier = 1
  if (style.travelStyles.includes("문화·역사")) attractionMultiplier = 1.4
  if (style.travelStyles.includes("휴양")) attractionMultiplier *= 0.5
  if (style.travelStyles.includes("액티비티")) attractionMultiplier *= 1.5
  
  // Schedule intensity affects transport/misc
  let othersMultiplier = 1
  if (style.scheduleIntensity === "빡빡하게") othersMultiplier = 1.5
  else if (style.scheduleIntensity === "여유롭게") othersMultiplier = 0.7
  
  // Shopping style
  if (style.travelStyles.includes("쇼핑")) othersMultiplier *= 1.5
  
  const flight = prices.flight * people
  const accommodation = Math.round(prices.hotel * hotelMultiplier * (days - 1) * Math.ceil(people / 2))
  const food = Math.round(prices.meal * foodMultiplier * 3 * days * people)
  const attractions = Math.round(prices.attraction * attractionMultiplier * days * people)
  const others = Math.round((50000 * days + 100000) * othersMultiplier * people)
  
  const total = flight + accommodation + food + attractions + others
  
  return {
    flight,
    accommodation,
    food,
    attractions,
    others,
    total,
    monthlySavings: 0
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount) + "원"
}

export function getDaysUntil(dateString: string): number {
  const target = new Date(dateString)
  const today = new Date()
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getMonthsUntil(dateString: string): number {
  const target = new Date(dateString)
  const today = new Date()
  const months = (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth())
  return Math.max(1, months)
}

export function getTripDays(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diff = end.getTime() - start.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
}

export function getEmotionalCopy(city: string, progress: number): string {
  if (progress < 25) {
    return `${city}로의 첫 걸음을 내딛었어요`
  } else if (progress < 50) {
    return `${city}에 가까워지는 중...`
  } else if (progress < 75) {
    return `${city}가 점점 선명해지고 있어요`
  } else if (progress < 100) {
    return `${city}가 코앞이에요!`
  } else {
    return `${city}로 떠날 준비 완료!`
  }
}
