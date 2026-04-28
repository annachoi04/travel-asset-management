"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import type { IncomeItem, ExpenseItem } from "@/lib/store"
import { generateId, formatCurrency } from "@/lib/store"

interface FinancialStepProps {
  incomes: IncomeItem[]
  fixedExpenses: ExpenseItem[]
  livingExpense: number
  initialSavings: number
  onUpdate: (data: {
    incomes: IncomeItem[]
    fixedExpenses: ExpenseItem[]
    livingExpense: number
    initialSavings: number
  }) => void
  onNext: () => void
}

export function FinancialStep({
  incomes,
  fixedExpenses,
  livingExpense,
  initialSavings,
  onUpdate,
  onNext,
}: FinancialStepProps) {
  const [localIncomes, setLocalIncomes] = useState<IncomeItem[]>(
    incomes.length > 0 ? incomes : [{ id: generateId(), name: "월급", amount: 0 }]
  )
  const [localExpenses, setLocalExpenses] = useState<ExpenseItem[]>(
    fixedExpenses.length > 0 ? fixedExpenses : [{ id: generateId(), name: "월세", amount: 0 }]
  )
  const [localLiving, setLocalLiving] = useState(livingExpense)
  const [localInitialSavings, setLocalInitialSavings] = useState(initialSavings)

  const totalIncome = localIncomes.reduce((sum, i) => sum + i.amount, 0)
  const totalExpense = localExpenses.reduce((sum, e) => sum + e.amount, 0)
  const savingsCapacity = totalIncome - totalExpense - localLiving

  const addIncome = () => {
    setLocalIncomes([...localIncomes, { id: generateId(), name: "", amount: 0 }])
  }

  const removeIncome = (id: string) => {
    if (localIncomes.length > 1) {
      setLocalIncomes(localIncomes.filter((i) => i.id !== id))
    }
  }

  const updateIncome = (id: string, field: "name" | "amount", value: string | number) => {
    setLocalIncomes(
      localIncomes.map((i) =>
        i.id === id ? { ...i, [field]: field === "amount" ? Number(value) : value } : i
      )
    )
  }

  const addExpense = () => {
    setLocalExpenses([...localExpenses, { id: generateId(), name: "", amount: 0 }])
  }

  const removeExpense = (id: string) => {
    if (localExpenses.length > 1) {
      setLocalExpenses(localExpenses.filter((e) => e.id !== id))
    }
  }

  const updateExpense = (id: string, field: "name" | "amount", value: string | number) => {
    setLocalExpenses(
      localExpenses.map((e) =>
        e.id === id ? { ...e, [field]: field === "amount" ? Number(value) : value } : e
      )
    )
  }

  const handleNext = () => {
    onUpdate({
      incomes: localIncomes.filter((i) => i.name && i.amount > 0),
      fixedExpenses: localExpenses.filter((e) => e.name && e.amount > 0),
      livingExpense: localLiving,
      initialSavings: localInitialSavings,
    })
    onNext()
  }

  const isValid = totalIncome > 0 && savingsCapacity >= 0

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 px-5 pt-12 pb-32">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          먼저 당신의 재정 상황을 알려주세요 ✈️
        </h1>
        <p className="text-muted-foreground mb-8">
          여행 저축 계획을 세우기 위해 필요해요
        </p>

        {/* Initial Savings Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            현재 이 여행을 위해 모아둔 돈이 있나요?
          </h2>
          <div className="relative">
            <input
              type="number"
              value={localInitialSavings || ""}
              onChange={(e) => setLocalInitialSavings(Number(e.target.value))}
              placeholder="0"
              className="w-full h-14 px-4 pr-10 rounded-xl bg-input text-foreground text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              원
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            지금까지 모은 금액을 포함해서 계획을 세워드려요
          </p>
        </section>

        {/* Income Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">수입</h2>
          <div className="space-y-3">
            {localIncomes.map((income) => (
              <div key={income.id} className="flex gap-3">
                <input
                  type="text"
                  value={income.name}
                  onChange={(e) => updateIncome(income.id, "name", e.target.value)}
                  placeholder="항목명"
                  className="flex-1 h-12 px-4 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={income.amount || ""}
                    onChange={(e) => updateIncome(income.id, "amount", e.target.value)}
                    placeholder="금액"
                    className="w-full h-12 px-4 pr-10 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    원
                  </span>
                </div>
                <button
                  onClick={() => removeIncome(income.id)}
                  className="h-12 w-12 flex items-center justify-center rounded-xl bg-input text-muted-foreground hover:text-destructive transition-colors"
                  disabled={localIncomes.length === 1}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addIncome}
            className="mt-3 flex items-center gap-2 text-primary font-medium"
          >
            <Plus className="w-5 h-5" />
            수입 항목 추가
          </button>
        </section>

        {/* Fixed Expenses Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">고정 지출</h2>
          <div className="space-y-3">
            {localExpenses.map((expense) => (
              <div key={expense.id} className="flex gap-3">
                <input
                  type="text"
                  value={expense.name}
                  onChange={(e) => updateExpense(expense.id, "name", e.target.value)}
                  placeholder="항목명"
                  className="flex-1 h-12 px-4 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={expense.amount || ""}
                    onChange={(e) => updateExpense(expense.id, "amount", e.target.value)}
                    placeholder="금액"
                    className="w-full h-12 px-4 pr-10 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    원
                  </span>
                </div>
                <button
                  onClick={() => removeExpense(expense.id)}
                  className="h-12 w-12 flex items-center justify-center rounded-xl bg-input text-muted-foreground hover:text-destructive transition-colors"
                  disabled={localExpenses.length === 1}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addExpense}
            className="mt-3 flex items-center gap-2 text-primary font-medium"
          >
            <Plus className="w-5 h-5" />
            지출 항목 추가
          </button>
        </section>

        {/* Living Expense Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-2">월 생활비</h2>
          <p className="text-sm text-muted-foreground mb-4">
            식비, 카페, 여가 등 변동 지출 평균
          </p>
          <div className="relative">
            <input
              type="number"
              value={localLiving || ""}
              onChange={(e) => setLocalLiving(Number(e.target.value))}
              placeholder="월 생활비"
              className="w-full h-14 px-4 pr-10 rounded-xl bg-input text-foreground text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              원
            </span>
          </div>
        </section>

        {/* Savings Capacity Display */}
        <div className="bg-accent rounded-2xl p-5">
          <p className="text-muted-foreground mb-2">매달 저축 가능액</p>
          <p className="text-3xl font-bold text-accent-foreground">
            {formatCurrency(Math.max(0, savingsCapacity))}
          </p>
          {savingsCapacity > 0 && (
            <p className="text-primary mt-2 font-medium">
              매달 약 {formatCurrency(savingsCapacity)}을 여행을 위해 모을 수 있어요 🎉
            </p>
          )}
          {savingsCapacity < 0 && (
            <p className="text-destructive mt-2 font-medium">
              지출이 수입보다 많아요. 금액을 조정해주세요.
            </p>
          )}
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-background border-t border-border">
        <Button
          onClick={handleNext}
          disabled={!isValid}
          className="w-full h-14 text-lg font-semibold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          다음
        </Button>
      </div>
    </div>
  )
}
