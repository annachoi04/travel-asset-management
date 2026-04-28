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
  const { hasCompletedOnboarding, trips, currentTripId, updateCurrentSavings, getSavingsCapacity } = useTravelStore()
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

  // Initial greeting
  useEffect(() => {
    if (isHydrated && currentTrip && messages.length === 0) {
      const action = searchParams.get("action")
      let greeting = `안녕하세요! ${currentTrip.city} 여행을 함께 준비할게요 ✈️\n오늘 무엇을 도와드릴까요?`
      
      if (action === "adjust") {
        greeting = `어떤 부분을 바꿔볼까요? 숙박을 낮추거나, 날짜를 조정하거나, 예산을 다시 짤 수 있어요 ✏️`
      }
      
      setMessages([
        {
          id: "greeting",
          role: "assistant",
          content: greeting,
        },
      ])
    }
  }, [isHydrated, currentTrip, searchParams, messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    const savingsCapacity = getSavingsCapacity()
    
    if (lowerMessage.includes("지출") || lowerMessage.includes("썼어")) {
      // Try to extract amount
      const amountMatch = userMessage.match(/(\d+(?:,\d+)?(?:\.\d+)?)\s*(?:만원|원)?/)
      if (amountMatch) {
        let amount = parseInt(amountMatch[1].replace(/,/g, ""))
        if (userMessage.includes("만원")) {
          amount *= 10000
        }
        return `${formatCurrency(amount)} 지출을 기록했어요! 💸\n\n오늘 남은 예산은 약 ${formatCurrency(Math.max(0, Math.floor(savingsCapacity / 30) - amount))}이에요.\n아껴쓰면 ${currentTrip?.city}가 더 가까워질 거예요!`
      }
      return "얼마를 지출하셨나요? '오늘 점심 15000원 썼어' 처럼 말씀해주세요!"
    }
    
    if (lowerMessage.includes("수입") || lowerMessage.includes("입금") || lowerMessage.includes("받았")) {
      const amountMatch = userMessage.match(/(\d+(?:,\d+)?(?:\.\d+)?)\s*(?:만원|원)?/)
      if (amountMatch) {
        let amount = parseInt(amountMatch[1].replace(/,/g, ""))
        if (userMessage.includes("만원")) {
          amount *= 10000
        }
        if (currentTrip) {
          updateCurrentSavings(currentTrip.id, amount)
        }
        return `${formatCurrency(amount)} 저축을 추가했어요! 🎉\n\n${currentTrip?.city}까지 한 걸음 더 가까워졌어요!\n현재 총 저축액: ${formatCurrency((currentTrip?.currentSavings || 0) + amount)}`
      }
      return "얼마를 저축하셨나요? '이번달 50만원 저축했어' 처럼 말씀해주세요!"
    }
    
    if (lowerMessage.includes("얼마") && (lowerMessage.includes("쓸 수") || lowerMessage.includes("사용"))) {
      const dailyBudget = Math.floor(savingsCapacity / 30)
      return `오늘 쓸 수 있는 돈은 약 ${formatCurrency(dailyBudget)}이에요! 💰\n\n이 페이스를 유지하면 ${currentTrip?.city} 여행 자금을 예정대로 모을 수 있어요 ✅`
    }
    
    if (lowerMessage.includes("조정") || lowerMessage.includes("변경") || lowerMessage.includes("바꾸")) {
      return `어떤 부분을 조정할까요? 🤔\n\n1️⃣ 여행 날짜 변경\n2️⃣ 숙박 등급 조정\n3️⃣ 예산 재계산\n4️⃣ 여행 스타일 변경\n\n원하시는 걸 말씀해주세요!`
    }
    
    if (lowerMessage.includes("날짜")) {
      return "출발일을 언제로 변경할까요? 예: '출발일 2025년 3월 15일로 바꿔줘'"
    }
    
    if (lowerMessage.includes("숙박") || lowerMessage.includes("호텔")) {
      return `현재 숙박 스타일은 '${currentTrip?.style.accommodationType}'이에요.\n\n🏨 호텔로 변경 (예산 +30%)\n🏠 에어비앤비로 변경 (예산 -20%)\n🛏️ 호스텔로 변경 (예산 -60%)\n\n어떤 걸로 바꿀까요?`
    }
    
    if (lowerMessage.includes("항공") && lowerMessage.includes("업데이트")) {
      return "항공권 가격을 확인 중이에요... ✈️\n\n실시간 가격 조회는 아래 링크에서 확인해주세요:\nhttps://www.google.com/travel/flights\n\n새로운 가격을 알려주시면 예산을 업데이트해드릴게요!"
    }
    
    if (lowerMessage.includes("안녕") || lowerMessage.includes("하이") || lowerMessage.includes("hello")) {
      return `안녕하세요! 😊\n${currentTrip?.city} 여행 준비는 잘 되고 있나요?\n무엇을 도와드릴까요?`
    }
    
    if (lowerMessage.includes("고마워") || lowerMessage.includes("감사")) {
      return "천만에요! 언제든 도움이 필요하면 말씀해주세요 😊\n좋은 여행이 되길 바랄게요! ✈️"
    }
    
    return `말씀하신 내용을 확인했어요!\n\n다른 도움이 필요하시면 아래 중에서 선택해주세요:\n\n🧾 지출 기록\n💰 수입 추가\n📊 예산 확인\n✏️ 계획 조정`
  }

  const handleSend = () => {
    if (!input.trim()) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }
    
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)
    
    // Simulate typing delay
    setTimeout(() => {
      const response = generateResponse(userMessage.content)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 800)
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
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-2xl">{flag}</span>
          <span className="font-semibold text-foreground">{currentTrip.city}</span>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-40">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={message.id}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-card text-card-foreground"
                )}
              >
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                  {message.content}
                </p>
              </div>
              
              {/* Quick actions after first assistant message */}
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

      {/* Input */}
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
