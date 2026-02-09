/* ── Types shared across the frontend ── */

export interface Citation {
  source: string
  title: string
  snippet: string
}

export interface ChatResponseData {
  answer: string
  citations: Citation[]
  disclaimer: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
  citations?: Citation[]
  disclaimer?: string
  timestamp: Date
}

/** A saved chat session for history */
export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: string   // ISO string
  updatedAt: string   // ISO string
}
