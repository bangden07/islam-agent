/* ── useVoice — Speech-to-Text via Web Speech API ── */

import { useCallback, useEffect, useRef, useState } from 'react'

/** Browser SpeechRecognition types (vendor-prefixed) */
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message?: string
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  abort(): void
  onresult: ((ev: SpeechRecognitionEvent) => void) | null
  onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  const w = window as unknown as Record<string, unknown>
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as SpeechRecognitionCtor | null
}

export interface UseVoiceReturn {
  /** Whether the Web Speech API is available */
  supported: boolean
  /** Currently listening to microphone */
  listening: boolean
  /** Interim (partial) transcript while speaking */
  interim: string
  /** Start listening */
  start: () => void
  /** Stop listening */
  stop: () => void
  /** Toggle listening on/off */
  toggle: () => void
}

interface UseVoiceOptions {
  /** Language code, default 'id-ID' (Indonesian) */
  lang?: string
  /** Called when a final transcript is available */
  onResult?: (transcript: string) => void
  /** Called on recognition error */
  onError?: (error: string) => void
}

export function useVoice(opts: UseVoiceOptions = {}): UseVoiceReturn {
  const { lang = 'id-ID', onResult, onError } = opts

  const [supported] = useState(() => getSpeechRecognition() !== null)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const recRef = useRef<SpeechRecognitionInstance | null>(null)

  // Store latest callbacks in refs to avoid re-creating recognition
  const onResultRef = useRef(onResult)
  const onErrorRef = useRef(onError)
  useEffect(() => { onResultRef.current = onResult }, [onResult])
  useEffect(() => { onErrorRef.current = onError }, [onError])

  const start = useCallback(() => {
    const Ctor = getSpeechRecognition()
    if (!Ctor) return

    // Stop any existing instance
    if (recRef.current) {
      try { recRef.current.abort() } catch { /* ignore */ }
    }

    const rec = new Ctor()
    rec.lang = lang
    rec.continuous = false
    rec.interimResults = true
    recRef.current = rec

    rec.onstart = () => {
      setListening(true)
      setInterim('')
    }

    rec.onresult = (ev: SpeechRecognitionEvent) => {
      let interimText = ''
      let finalText = ''

      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const result = ev.results[i]
        if (result.isFinal) {
          finalText += result[0].transcript
        } else {
          interimText += result[0].transcript
        }
      }

      if (interimText) setInterim(interimText)

      if (finalText) {
        setInterim('')
        onResultRef.current?.(finalText.trim())
      }
    }

    rec.onerror = (ev: SpeechRecognitionErrorEvent) => {
      // 'aborted' and 'no-speech' are non-critical
      if (ev.error !== 'aborted' && ev.error !== 'no-speech') {
        const msg =
          ev.error === 'not-allowed'
            ? 'Izin mikrofon ditolak. Aktifkan di pengaturan browser.'
            : `Voice error: ${ev.error}`
        onErrorRef.current?.(msg)
      }
      setListening(false)
      setInterim('')
    }

    rec.onend = () => {
      setListening(false)
    }

    rec.start()
  }, [lang])

  const stop = useCallback(() => {
    if (recRef.current) {
      try { recRef.current.stop() } catch { /* ignore */ }
    }
  }, [])

  const toggle = useCallback(() => {
    if (listening) stop()
    else start()
  }, [listening, start, stop])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recRef.current) {
        try { recRef.current.abort() } catch { /* ignore */ }
      }
    }
  }, [])

  return { supported, listening, interim, start, stop, toggle }
}
