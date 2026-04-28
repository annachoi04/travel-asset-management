"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { TravelInfoStep } from "@/components/onboarding/travel-info-step"
import { TravelStyleStep } from "@/components/onboarding/travel-style-step"
import { BudgetResultStep } from "@/components/onboarding/budget-result-step"
import {
  useTravelStore,
  type TravelStyle,
  type TravelBudget,
  calculateBudget,
  generateId,
  getTripDays,
  getMonthsUntil,
} from "@/lib/store"

interface NewTripModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewTripModal({ isOpen, onClose }: NewTripModalProps) {
  const { addTrip, getSavingsCapacity } = useTravelStore()
  
  const [step, setStep] = useState(1)
  
  // Travel info state
  const [tripName, setTripName] = useState("")
  const [country, setCountry] = useState("")
  const [city, setCity] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [people, setPeople] = useState(1)
  
  // Style state
  const [style, setStyle] = useState<TravelStyle>({
    travelStyles: [],
    accommodationType: "",
    scheduleIntensity: "",
    foodPriority: "",
    mustVisit: "",
    avoidPlaces: "",
  })
  
  // Budget state
  const [budget, setBudget] = useState<TravelBudget>({
    flight: 0,
    accommodation: 0,
    food: 0,
    attractions: 0,
    others: 0,
    total: 0,
    monthlySavings: 0,
  })

  const handleTravelInfoUpdate = (data: {
    tripName: string
    country: string
    city: string
    startDate: string
    endDate: string
    people: number
  }) => {
    setTripName(data.tripName)
    setCountry(data.country)
    setCity(data.city)
    setStartDate(data.startDate)
    setEndDate(data.endDate)
    setPeople(data.people)
  }

  const handleStyleUpdate = (newStyle: TravelStyle) => {
    setStyle(newStyle)
    
    if (country && city && startDate && endDate) {
      const days = getTripDays(startDate, endDate)
      const calculatedBudget = calculateBudget(country, city, days, people, newStyle)
      const months = getMonthsUntil(startDate)
      calculatedBudget.monthlySavings = Math.ceil(calculatedBudget.total / months)
      setBudget(calculatedBudget)
    }
  }

  const handleConfirm = () => {
    const months = getMonthsUntil(startDate)
    const monthlySavings = Math.ceil(budget.total / months)
    
    const newTrip = {
      id: generateId(),
      name: tripName,
      country,
      city,
      startDate,
      endDate,
      people,
      style,
      budget: { ...budget, monthlySavings },
      currentSavings: 0,
      createdAt: new Date().toISOString(),
    }
    
    addTrip(newTrip)
    resetAndClose()
  }

  const resetAndClose = () => {
    setStep(1)
    setTripName("")
    setCountry("")
    setCity("")
    setStartDate("")
    setEndDate("")
    setPeople(1)
    setStyle({
      travelStyles: [],
      accommodationType: "",
      scheduleIntensity: "",
      foodPriority: "",
      mustVisit: "",
      avoidPlaces: "",
    })
    setBudget({
      flight: 0,
      accommodation: 0,
      food: 0,
      attractions: 0,
      others: 0,
      total: 0,
      monthlySavings: 0,
    })
    onClose()
  }

  const savingsCapacity = getSavingsCapacity()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={resetAndClose}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-6 h-6" />
          </button>
          <span className="font-semibold text-foreground">새 여행 추가</span>
          <div className="w-10" />
        </div>
        
        {/* Progress */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="pt-16">
        {step === 1 && (
          <TravelInfoStep
            tripName={tripName}
            country={country}
            city={city}
            startDate={startDate}
            endDate={endDate}
            people={people}
            onUpdate={handleTravelInfoUpdate}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <TravelStyleStep
            style={style}
            onUpdate={handleStyleUpdate}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <BudgetResultStep
            tripName={tripName}
            country={country}
            city={city}
            startDate={startDate}
            endDate={endDate}
            people={people}
            style={style}
            budget={budget}
            monthlySavingsCapacity={savingsCapacity}
            onConfirm={handleConfirm}
            onAdjust={() => setStep(2)}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </div>
  )
}
