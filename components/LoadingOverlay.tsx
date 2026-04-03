'use client'

export default function LoadingOverlay({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0f]/90 backdrop-blur-sm">
      <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#1e1e2e] border-t-[#4f6ef7]" />
      <p className="text-sm text-[#888]">{message}</p>
    </div>
  )
}
