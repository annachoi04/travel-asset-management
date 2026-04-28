import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai'

export const maxDuration = 30

interface TripContext {
  city: string
  country: string
  targetAmount: number
  currentSavings: number
  monthlySavingsCapacity: number
  startDate: string
}

function buildSystemPrompt(tripContext?: TripContext): string {
  const basePrompt = `당신은 여행 자산관리 에이전트입니다. 사용자의 여행 목표와 재정 상황을 파악해서 오늘의 소비 결정을 도와주세요.

핵심 역할:
1. 지출 말하면 ('오늘 18000원 썼어') 금액 파악하고 여행 목표와 연결해서 코멘트
2. 소비 판단 요청 ('배달 시켜먹어도 돼?') 하면 재정 상황 기반으로 판단
3. 수입/저축 말하면 ('30만원 저축했어') 목표까지 얼마 남았는지 알려주기
4. 계획 조정 요청하면 대안 제시

답변 규칙:
- 2-3문장으로 짧고 명확하게
- 여행지 이름으로 동기부여
- 숫자 구체적으로
- 친근하고 따뜻한 말투`

  if (tripContext) {
    const remainingAmount = tripContext.targetAmount - tripContext.currentSavings
    const progress = Math.round((tripContext.currentSavings / tripContext.targetAmount) * 100)
    
    return `${basePrompt}

현재 사용자의 여행 정보:
- 여행지: ${tripContext.country} ${tripContext.city}
- 목표 금액: ${tripContext.targetAmount.toLocaleString()}원
- 현재 저축액: ${tripContext.currentSavings.toLocaleString()}원 (${progress}% 달성)
- 남은 금액: ${remainingAmount.toLocaleString()}원
- 월 저축 가능액: ${tripContext.monthlySavingsCapacity.toLocaleString()}원
- 출발 예정일: ${tripContext.startDate}

이 정보를 바탕으로 사용자의 소비 결정을 도와주세요. 항상 ${tripContext.city} 여행을 언급하며 동기부여해주세요.`
  }

  return basePrompt
}

export async function POST(req: Request) {
  const { messages, tripContext }: { messages: UIMessage[]; tripContext?: TripContext } = await req.json()

  const systemPrompt = buildSystemPrompt(tripContext)

  const result = streamText({
    model: 'anthropic/claude-sonnet-4-20250514',
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  })
}
