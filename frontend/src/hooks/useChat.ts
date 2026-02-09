/* ── useChat hook — manages chat state ── */

import { useCallback, useState } from 'react'
import { sendMessage } from '../services/api'
import type { Message } from '../types/chat'

let _id = 0
function nextId() {
  return String(++_id)
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = useCallback(async (text: string, imageUrl?: string) => {
    const trimmed = text.trim()
    if (!trimmed && !imageUrl) return

    setError(null)

    // Add user message
    const userMsg: Message = {
      id: nextId(),
      role: 'user',
      content: trimmed || '(gambar)',
      imageUrl,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const data = await sendMessage(trimmed || 'Tolong jelaskan gambar ini.', imageUrl)

      const assistantMsg: Message = {
        id: nextId(),
        role: 'assistant',
        content: data.answer,
        citations: data.citations,
        disclaimer: data.disclaimer,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, loading, error, send, clear, setMessages }
}
