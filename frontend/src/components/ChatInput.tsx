/* ── ChatInput — Premium floating input bar ── */

import { useRef, useState, useEffect, type FormEvent, type KeyboardEvent, type ChangeEvent } from 'react'
import { Box, Flex, IconButton, Text, Textarea, Image } from '@chakra-ui/react'
import { useVoice } from '../hooks/useVoice'

interface Props {
  onSend: (text: string, imageUrl?: string) => void
  disabled?: boolean
}

/** Convert a File to a data-URI string (base64). */
function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/* SVG icons */
const ImageIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

const MicIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
  </svg>
)

const StopIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
)

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

const CloseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const voice = useVoice({
    lang: 'id-ID',
    onResult: (transcript) => {
      setText((prev) => {
        const combined = prev ? `${prev} ${transcript}` : transcript
        return combined
      })
    },
  })

  useEffect(() => {
    if (disabled && voice.listening) voice.stop()
  }, [disabled, voice.listening, voice.stop])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if ((text.trim() || imagePreview) && !disabled) {
      if (voice.listening) voice.stop()
      onSend(text, imagePreview ?? undefined)
      setText('')
      setImagePreview(null)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    if (file.size > 4 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 4 MB')
      return
    }
    const dataUri = await fileToDataUri(file)
    setImagePreview(dataUri)
    if (fileRef.current) fileRef.current.value = ''
  }

  const removeImage = () => setImagePreview(null)

  const canSend = (text.trim() || imagePreview) && !disabled

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      px={4}
      py={3}
      flexShrink={0}
      bg="bg.surface"
    >
      <Box
        maxW="800px"
        mx="auto"
        rounded="2xl"
        className="shadow-premium-lg"
        css={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(232, 184, 61, 0.12)',
        }}
      >
        {/* Image preview */}
        {imagePreview && (
          <Flex px={3} pt={3} align="center" gap={2}>
            <Box position="relative" display="inline-block">
              <Image
                src={imagePreview}
                alt="Preview"
                maxH="72px"
                rounded="xl"
                objectFit="cover"
                css={{
                  border: '2px solid rgba(232, 184, 61, 0.2)',
                }}
              />
              <IconButton
                aria-label="Hapus gambar"
                size="xs"
                rounded="full"
                position="absolute"
                top="-6px"
                right="-6px"
                bg="red.500"
                color="white"
                _hover={{ bg: 'red.600' }}
                onClick={removeImage}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Flex>
        )}

        {/* Voice indicator */}
        {voice.listening && (
          <Flex px={4} pt={2} align="center" gap={2}>
            <Box
              w="8px"
              h="8px"
              bg="red.500"
              rounded="full"
              animation="pulse 1s ease-in-out infinite"
            />
            <Text fontSize="xs" color="gray.500" fontWeight="500">
              {voice.interim || 'Mendengarkan...'}
            </Text>
          </Flex>
        )}

        {/* Input row */}
        <Flex align="end" gap={1.5} px={2} py={2}>
          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {/* Image upload */}
          <IconButton
            type="button"
            aria-label="Upload gambar"
            onClick={() => fileRef.current?.click()}
            disabled={disabled}
            variant="ghost"
            color="gray.400"
            rounded="xl"
            size="md"
            flexShrink={0}
            _hover={{ color: 'brand.600', bg: 'brand.50' }}
          >
            <ImageIcon />
          </IconButton>

          {/* Mic */}
          {voice.supported && (
            <IconButton
              type="button"
              aria-label={voice.listening ? 'Berhenti' : 'Bicara'}
              onClick={voice.toggle}
              disabled={disabled}
              variant="ghost"
              color={voice.listening ? 'white' : 'gray.400'}
              rounded="xl"
              size="md"
              flexShrink={0}
              css={voice.listening ? {
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                '&:hover': { opacity: 0.9 },
              } : {
                '&:hover': { color: '#1a8f5c', background: 'rgba(26, 143, 92, 0.06)' },
              }}
            >
              {voice.listening ? <StopIcon /> : <MicIcon />}
            </IconButton>
          )}

          {/* Text area */}
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pertanyaan Anda..."
            rows={1}
            disabled={disabled}
            resize="none"
            fontSize="sm"
            rounded="xl"
            border="none"
            _focus={{ boxShadow: 'none', outline: 'none' }}
            _placeholder={{ color: 'gray.400' }}
            px={3}
            py={2.5}
            minH="42px"
            maxH="120px"
            css={{ overflow: 'auto', background: 'transparent' }}
          />

          {/* Send */}
          <IconButton
            type="submit"
            aria-label="Kirim"
            disabled={!canSend}
            rounded="xl"
            size="md"
            flexShrink={0}
            color="white"
            _disabled={{ opacity: 0.3, cursor: 'not-allowed' }}
            css={{
              background: canSend
                ? 'linear-gradient(135deg, #12754a, #0d5c3a)'
                : '#d1d5db',
              transition: 'all 0.2s ease',
              '&:hover:not(:disabled)': {
                background: 'linear-gradient(135deg, #0d5c3a, #073822)',
                transform: 'scale(1.05)',
              },
              '&:active:not(:disabled)': {
                transform: 'scale(0.98)',
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Flex>
      </Box>
    </Box>
  )
}
