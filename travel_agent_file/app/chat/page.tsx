"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Send, ArrowLeft } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { useTravelStore, countryData, formatCurrency } from "@/lib/store"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const quickActions = [
  { id: "expense", label: "🧾 지출 기록할게요", text: "지출 기록할게요" },
  { id: "income", label: "💰 수입 추가할게요", text: "수입 추가할게요" },
  { id: "budget", label: "📊 오늘 얼마 쓸 수 있어요?", text: "오늘 얼마 쓸 수 있어요?" },
  { id: "adjust", label: "✏️ 계획 조정하고 싶어요", text: "계획 조정하고 싶어요" },
]

function ChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { hasCompletedOnboarding, trips, currentTripId, updateCurrentSavings, getSavingsCapacity, financialInfo } = useTravelStore()
  const [isHydrated, setIsHydrated] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentTrip = trips.find((t) => t.id === currentTripId)
  const flag = currentTrip ? countryData[currentTrip.country]?.flag : "🌍"

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && !hasCompletedOnboarding) {
      router.push("/onboarding")
    }
  }, [isHydrated, hasCompletedOnboarding, router])

  useEffect(() => {
    if (isHydrated && currentTrip && messages.length === 0) {
      const action = searchParams.get("action")
      let greeting = `안녕하세요! ${currentTrip.city} 여행을 함께 준비할게요 ✈️\n오늘 무엇을 도와드릴까요?`
      if (action === "adjust") {
        greeting = `어떤 부분을 바꿔볼까요? 숙박을 낮추거나, 날짜를 조정하거나, 예산을 다시 짤 수 있어요 ✏️`
      }
      setMessages([{ id: "greeting", role: "assistant", content: greeting }])
    }
  }, [isHydrated, currentTrip, searchParams, messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const savingsCapacity = getSavingsCapacity()
      const dailyBudget = Math.floor(savingsCapacity / 30)
      const remainingAmount = (currentTrip?.targetAmount || 0) - (currentTrip?.currentSavings || 0)
      const monthsLeft = currentTrip ? Math.ceil((new Date(currentTrip.departureDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)) : 0

      const systemPrompt = `당신은 여행 자산관리 에이전트입니다. 사용자가 여행 목표를 포기하지 않도록 오늘의 소비 결정을 도와주세요.

## 사용자 여행 정보
- 여행지: ${currentTrip?.city}, ${currentTrip?.country}
- 출발일: ${currentTrip?.departureDate}
- 여행 기간: ${currentTrip?.duration}박
- 인원: ${currentTrip?.travelers}명
- 여행까지 남은 개월: ${monthsLeft}개월

## 사용자 재정 정보
- 총 목표 경비: ${formatCurrency(currentTrip?.targetAmount || 0)}
- 현재 저축액: ${formatCurrency(currentTrip?.currentSavings || 0)}
- 남은 필요 금액: ${formatCurrency(remainingAmount)}
- 월 저축 가능액: ${formatCurrency(savingsCapacity)}
- 오늘 쓸 수 있는 돈: ${formatCurrency(dailyBudget)}

## 핵심 역할
1. 지출 보고 ('오늘 18000원 썼어') → 금액 파악하고 여행 목표와 연결해서 코멘트
2. 소비 판단 요청 ('배달 시켜먹어도 돼?') → 재정 상황 기반으로 판단, 여행 날짜와 연결해서 경고
3. 수입/저축 업데이트 ('30만원 저축했어') → 목표까지 얼마 남았는지 계산해서 알려주기
4. 계획 조정 요청 → 구체적인 대안 제시 (숙박 등급 변경, 날짜 조정 등)
5. 오늘 예산 질문 → 구체적인 금액과 함께 동기부여 메시지

## 답변 규칙
- 2-3문장으로 짧고 명확하게
- 여행지 이름(${currentTrip?.city})으로 동기부여
- 숫자는 항상 구체적으로 (원 단위로)
- 친근하고 따뜻한 말투
- 단순히 메뉴 목록 나열하지 말고 질문에 직접 답할 것
- 지출이 많으면 여행 날짜가 며칠 늦어지는지 계산해서 경고
- 저축하면 여행까지 며칠 당겨지는지 계산해서 칭찬`

      const conversationMessages = messages
        .filter(m => m.id !== "greeting")
        .concat(userMessage)
        .map(m => ({ role: m.role, content: m.content }))

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationMessages,
          system: systemPrompt,
        }),
      })

      const data = await response.json()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || "죄송해요, 잠시 후 다시 시도해주세요.",
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "죄송해요, 연결에 문제가 생겼어요. 잠시 후 다시 시도해주세요.",
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickAction = (text: string) => {
    setInput(text)
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!hasCompletedOnboarding || !currentTrip) return null

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-2xl">{flag}</span>
          <span className="font-semibold text-foreground">{currentTrip.city}</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-40">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={message.id}>
              <div className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3",
                message.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-card text-card-foreground"
              )}>
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
              </div>
              {message.role === "assistant" && index === 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action.text)}
                      className="px-3 py-2 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:bg-accent/80 transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="max-w-[85%] bg-card text-card-foreground rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <div className="fixed bottom-16 left-0 right-0 bg-background border-t border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="메시지를 입력하세요..."
            className="flex-1 h-12 px-4 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ChatContent />
    </Suspense>
  )
}
