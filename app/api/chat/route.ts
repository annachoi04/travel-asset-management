import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `당신은 여행 자산관리 에이전트입니다. 사용자의 여행 목표와 재정 상황을 파악해서 오늘의 소비 결정을 도와주세요.

핵심 역할:
1. 지출 말하면 ('오늘 18000원 썼어') 금액 파악하고 여행 목표와 연결해서 코멘트
2. 소비 판단 요청 ('배달 시켜먹어도 돼?') 하면 재정 상황 기반으로 판단
3. 수입/저축 말하면 ('30만원 저축했어') 목표까지 얼마 남았는지 알려주기
4. 계획 조정 요청하면 대안 제시

답변 규칙:
- 2-3문장으로 짧고 명확하게
- 여행지 이름으로 동기부여
- 숫자 구체적으로
- 친근하고 따뜻한 말투`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const { messages }: { messages: Message[] } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages 배열이 필요합니다." },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Anthropic API error:", errorData);
      return NextResponse.json(
        { error: "Claude API 요청 실패", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.content[0]?.text || "";

    return NextResponse.json({
      message: assistantMessage,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
