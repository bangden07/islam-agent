/* ── useChatHistory — persist chat sessions to localStorage ── */

import { useCallback, useState } from 'react'
import type { ChatSession, Message } from '../types/chat'

const STORAGE_KEY = 'islam-agent-history'
const MAX_SESSIONS = 50

/** Serialize messages (Date → string) */
function serialize(sessions: ChatSession[]): string {
  return JSON.stringify(sessions)
}

/** Deserialize (string → Date in messages) */
function deserialize(raw: string): ChatSession[] {
  try {
    const parsed = JSON.parse(raw) as ChatSession[]
    return parsed.map((s) => ({
      ...s,
      messages: s.messages.map((m) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })),
    }))
  } catch {
    return []
  }
}

function loadSessions(): ChatSession[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  return deserialize(raw)
}

function saveSessions(sessions: ChatSession[]) {
  localStorage.setItem(STORAGE_KEY, serialize(sessions))
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

/** Extract a short title from the first user message */
function extractTitle(messages: Message[]): string {
  const first = messages.find((m) => m.role === 'user')
  if (!first) return 'Percakapan Baru'
  const text = first.content.slice(0, 60)
  return text.length < first.content.length ? text + '…' : text
}

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions)
  const [activeId, setActiveId] = useState<string | null>(null)

  /** Save / update a session from current messages */
  const saveSession = useCallback(
    (messages: Message[]) => {
      if (messages.length === 0) return

      const now = new Date().toISOString()

      setSessions((prev) => {
        let updated: ChatSession[]

        if (activeId) {
          // Update existing session
          updated = prev.map((s) =>
            s.id === activeId
              ? { ...s, messages, title: extractTitle(messages), updatedAt: now }
              : s,
          )
        } else {
          // Create new session
          const newSession: ChatSession = {
            id: generateId(),
            title: extractTitle(messages),
            messages,
            createdAt: now,
            updatedAt: now,
          }
          setActiveId(newSession.id)
          updated = [newSession, ...prev]
        }

        // Limit total sessions
        if (updated.length > MAX_SESSIONS) {
          updated = updated.slice(0, MAX_SESSIONS)
        }

        saveSessions(updated)
        return updated
      })
    },
    [activeId],
  )

  /** Load a session by id, returns its messages */
  const loadSession = useCallback(
    (id: string): Message[] | null => {
      const session = sessions.find((s) => s.id === id)
      if (!session) return null
      setActiveId(id)
      return session.messages
    },
    [sessions],
  )

  /** Start a new chat (clear activeId) */
  const newChat = useCallback(() => {
    setActiveId(null)
  }, [])

  /** Delete a session */
  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const updated = prev.filter((s) => s.id !== id)
        saveSessions(updated)
        return updated
      })
      if (activeId === id) setActiveId(null)
    },
    [activeId],
  )

  /** Delete all sessions */
  const clearAll = useCallback(() => {
    setSessions([])
    setActiveId(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    sessions,
    activeId,
    saveSession,
    loadSession,
    newChat,
    deleteSession,
    clearAll,
  }
}
