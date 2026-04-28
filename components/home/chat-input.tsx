"use client"

import { useRouter } from "next/navigation"
import { Send } from "lucide-react"

export function ChatInput() {
  const router = useRouter()

  const handleClick = () => {
    router.push("/chat")
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 px-4 pb-2">
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-3 px-4 py-4 bg-card rounded-2xl border border-border shadow-sm"
      >
        <span className="flex-1 text-left text-muted-foreground">
          에이전트에게 말을 걸어보세요...
        </span>
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <Send className="w-5 h-5 text-primary-foreground" />
        </div>
      </button>
    </div>
  )
}
