/* ── API service — talks to the thin proxy backend ── */

import type { ChatResponseData } from '../types/chat'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/**
 * Send a message to the proxy backend which forwards to Gradient™ agent.
 */
export async function sendMessage(message: string, imageBase64?: string): Promise<ChatResponseData> {
  const payload: Record<string, unknown> = { message }
  if (imageBase64) payload.image = imageBase64

  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error')
    throw new Error(`Server error ${res.status}: ${text}`)
  }

  return res.json()
}

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`)
    return res.ok
  } catch {
    return false
  }
}
