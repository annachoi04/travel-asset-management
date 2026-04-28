"use client"

import { useState, useEffect, useRef, Suspense, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Send, ArrowLeft } from "lucide-react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, UIMessage } from "ai"
import { BottomNav } from "@/components/bottom-nav"
import { useTravelStore, countryData, formatCurrency } from "@/lib/store"
import { cn } from "@/lib/utils"

const quickActions = [
  { id: "expense", label: "지출 기록할게요", text: "지출 기록할게요" },
  { id: "income", label: "수입 추가할게요", text: "수입 추가할게요" },
  { id: "budget", label: "오늘 얼마 쓸 수 있어요?", text: "오늘 얼마 쓸 수 있어요?" },
  { id: "adjust", label: "계획 조정하고 싶어요", text: "계획 조정하고 싶어요" },
]

function getUIMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

function ChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { hasCompletedOnboarding, trips, currentTripId, getSavingsCapacity, updateCurrentSavings } = useTravelStore()
  const [isHydrated, setIsHydrated] = useState(false)
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentTrip = trips.find((t) => t.id === currentTripId)
  const flag = currentTrip ? countryData[currentTrip.country]?.flag : ""
  const savingsCapacity = getSavingsCapacity()

  // Build trip context for API
  const tripContext = useMemo(() => {
    if (!currentTrip) return undefined
    return {
      city: currentTrip.city,
      country: currentTrip.country,
      targetAmount: currentTrip.budget.total,
      currentSavings: currentTrip.currentSavings,
      monthlySavingsCapacity: savingsCapacity,
      startDate: currentTrip.startDate,
    }
  }, [currentTrip, savingsCapacity])

  // Initial greeting message
  const initialGreeting = useMemo(() => {
    if (!currentTrip) return ""
    const action = searchParams.get("action")
    if (action === "adjust") {
      return `어떤 부분을 바꿔볼까요? 숙박을 낮추거나, 날짜를 조정하거나, 예산을 다시 짤 수 있어요.`
    }
    return `안녕하세요! ${currentTrip.city} 여행을 함께 준비할게요.\n오늘 무엇을 도와드릴까요?`
  }, [currentTrip, searchParams])

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages }) => ({
        body: {
          messages,
          tripContext,
        },
      }),
    }),
    initialMessages: initialGreeting ? [
      {
        id: "greeting",
        role: "assistant",
        parts: [{ type: "text", text: initialGreeting }],
      },
    ] : [],
  })

  const isStreaming = status === "streaming" || status === "submitted"

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && !hasCompletedOnboarding) {
      router.push("/onboarding")
    }
  }, [isHydrated, hasCompletedOnboarding, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Check for savings updates in assistant messages
  useEffect(() => {
    if (!currentTrip) return
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === "assistant") {
      const text = getUIMessageText(lastMessage)
      // Simple pattern to detect savings confirmation
      const savingsMatch = text.match(/(\d{1,3}(?:,\d{3})*)\s*원\s*저축을?\s*(?:추가|기록)/)
      if (savingsMatch) {
        const amount = parseInt(savingsMatch[1].replace(/,/g, ""))
        if (amount > 0 && !lastMessage.id.includes("processed")) {
          updateCurrentSavings(currentTrip.id, amount)
        }
      }
    }
  }, [messages, currentTrip, updateCurrentSavings])

  const handleSend = () => {
    if (!input.trim() || isStreaming) return
    sendMessage({ text: input.trim() })
    setInput("")
  }

  const handleQuickAction = (text: string) => {
    if (isStreaming) return
    sendMessage({ text })
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
          <div>
            <span className="font-semibold text-foreground">{currentTrip.city}</span>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(currentTrip.currentSavings)} / {formatCurrency(currentTrip.budget.total)}
            </p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-40">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const text = getUIMessageText(message)
            if (!text) return null
            
            return (
              <div key={message.id}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    message.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-card text-card-foreground shadow-sm"
                  )}
                >
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                    {text}
                  </p>
                </div>
                
                {/* Quick actions after first assistant message */}
                {message.role === "assistant" && index === 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {quickActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleQuickAction(action.text)}
                        disabled={isStreaming}
                        className="px-3 py-2 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:bg-accent/80 transition-colors disabled:opacity-50"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          
          {isStreaming && messages[messages.length - 1]?.role === "user" && (
            <div className="max-w-[85%] bg-card text-card-foreground rounded-2xl px-4 py-3 shadow-sm">
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
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="메시지를 입력하세요..."
            disabled={isStreaming}
            className="flex-1 h-12 px-4 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
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
