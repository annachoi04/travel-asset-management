"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FinancialStep } from "./financial-step"
import { TravelInfoStep } from "./travel-info-step"
import { TravelStyleStep } from "./travel-style-step"
import { BudgetResultStep } from "./budget-result-step"
import {
  useTravelStore,
  type FinancialInfo,
  type TravelStyle,
  type TravelBudget,
  calculateBudget,
  generateId,
  getTripDays,
  getMonthsUntil,
} from "@/lib/store"

export function OnboardingFlow() {
  const router = useRouter()
  const {
    financialInfo,
    setFinancialInfo,
    addTrip,
    setHasCompletedOnboarding,
    getSavingsCapacity,
  } = useTravelStore()

  const [step, setStep] = useState(1)
  
  // Financial info state
  const [localFinancial, setLocalFinancial] = useState<FinancialInfo>(financialInfo)
  
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

  const handleFinancialUpdate = (data: FinancialInfo) => {
    setLocalFinancial(data)
    setFinancialInfo(data)
  }

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
    
    // Calculate budget when style is updated
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
      currentSavings: localFinancial.initialSavings,
      createdAt: new Date().toISOString(),
    }
    
    addTrip(newTrip)
    setHasCompletedOnboarding(true)
    router.push("/")
  }

  const handleAdjust = () => {
    // Go back to style step
    setStep(3)
  }

  // Calculate savings capacity for display
  const totalIncome = localFinancial.incomes.reduce((sum, i) => sum + i.amount, 0)
  const totalExpense = localFinancial.fixedExpenses.reduce((sum, e) => sum + e.amount, 0)
  const savingsCapacity = totalIncome - totalExpense - localFinancial.livingExpense

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background pt-safe">
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <FinancialStep
          incomes={localFinancial.incomes}
          fixedExpenses={localFinancial.fixedExpenses}
          livingExpense={localFinancial.livingExpense}
          initialSavings={localFinancial.initialSavings}
          onUpdate={handleFinancialUpdate}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <TravelInfoStep
          tripName={tripName}
          country={country}
          city={city}
          startDate={startDate}
          endDate={endDate}
          people={people}
          onUpdate={handleTravelInfoUpdate}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <TravelStyleStep
          style={style}
          onUpdate={handleStyleUpdate}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
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
          initialSavings={localFinancial.initialSavings}
          onConfirm={handleConfirm}
          onAdjust={handleAdjust}
          onBack={() => setStep(3)}
        />
      )}
    </div>
  )
}
