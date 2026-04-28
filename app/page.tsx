import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">여행 자산관리</h1>
      <p className="text-[var(--muted-foreground)] mb-8">
        여행 목표를 위한 스마트한 자산관리 도우미
      </p>
      <Link
        href="/chat"
        className="px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg font-medium hover:opacity-90 transition-opacity"
      >
        채팅 시작하기
      </Link>
    </main>
  );
}
