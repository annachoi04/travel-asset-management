import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { messages, system } = await request.json()

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system,
        messages,
      }),
    })

    const data = await response.json()
    const content = data.content?.[0]?.text || "죄송해요, 잠시 후 다시 시도해주세요."

    return NextResponse.json({ content })
  } catch (error) {
    return NextResponse.json(
      { content: "연결에 문제가 생겼어요. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    )
  }
}
