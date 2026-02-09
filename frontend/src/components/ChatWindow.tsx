/* ── ChatWindow — Premium Islamic chat container ── */

import { useEffect, useRef } from 'react'
import { Box, Flex, Heading, Text, VStack } from '@chakra-ui/react'
import type { Message } from '../types/chat'
import { ChatBubble } from './ChatBubble'

interface Props {
  messages: Message[]
  loading: boolean
  onSend?: (text: string) => void
}

const HINT_QUESTIONS = [
  { icon: '🕌', text: 'Bagaimana cara menjaga istiqomah?' },
  { icon: '🛤️', text: 'Apa hukum sholat jamak saat bepergian?' },
  { icon: '💚', text: 'Bagaimana Islam memandang kecemasan?' },
  { icon: '📖', text: 'Saya ingin belajar tentang faraidh' },
]

/* Decorative Islamic ornament divider */
const OrnamentDivider = () => (
  <Flex align="center" gap={3} justify="center" my={2}>
    <Box w="40px" h="1px" css={{ background: 'linear-gradient(90deg, transparent, #e8b83d)' }} />
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" fill="#e8b83d" opacity="0.6" />
    </svg>
    <Box w="40px" h="1px" css={{ background: 'linear-gradient(90deg, #e8b83d, transparent)' }} />
  </Flex>
)

export function ChatWindow({ messages, loading, onSend }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <Box
      flex="1"
      overflowY="auto"
      px={4}
      py={4}
      className="islamic-pattern-gold"
    >
      <Box maxW="800px" mx="auto">
        {messages.length === 0 && (
          <Flex
            direction="column"
            align="center"
            pt={12}
            pb={8}
            gap={3}
            css={{ animation: 'fadeIn 0.6s ease' }}
          >
            {/* Bismillah calligraphy */}
            <Box
              css={{ animation: 'gentleFloat 4s ease-in-out infinite' }}
            >
              <Text
                fontFamily="'Amiri', 'Scheherazade New', serif"
                fontSize="3xl"
                color="brand.700"
                textAlign="center"
                lineHeight="1.8"
                css={{
                  textShadow: '0 1px 2px rgba(13, 92, 58, 0.08)',
                }}
              >
                بِسْمِ ٱللّٰهِ ٱلرَّحْمٰنِ ٱلرَّحِيْمِ
              </Text>
            </Box>

            <OrnamentDivider />

            <Heading
              size="xl"
              color="brand.800"
              fontWeight="700"
              letterSpacing="-0.02em"
            >
              Assalamu&apos;alaikum
            </Heading>

            <Text
              color="gray.500"
              textAlign="center"
              maxW="420px"
              fontSize="sm"
              lineHeight="1.7"
            >
              Silakan tanyakan apa saja seputar Islam — ibadah, akhlak,
              fikih, kehidupan, atau keluh kesah. Saya bantu dengan rujukan yang jelas.
            </Text>

            {/* Hint cards */}
            <VStack gap={2.5} mt={5} w="full" maxW="400px">
              {HINT_QUESTIONS.map((q, i) => (
                <Box
                  key={i}
                  as="button"
                  w="full"
                  px={4}
                  py={3.5}
                  rounded="xl"
                  fontSize="sm"
                  color="gray.700"
                  textAlign="left"
                  cursor="pointer"
                  transition="all 0.2s cubic-bezier(0.22, 1, 0.36, 1)"
                  className="hint-card shadow-premium"
                  css={{
                    animationDelay: `${i * 0.08}s`,
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(232, 184, 61, 0.15)',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 1)',
                      borderColor: 'rgba(232, 184, 61, 0.4)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 16px rgba(13, 92, 58, 0.08), 0 0 0 1px rgba(232, 184, 61, 0.2)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                  }}
                  onClick={() => onSend?.(q.text)}
                >
                  <Flex align="center" gap={3}>
                    <Text fontSize="lg">{q.icon}</Text>
                    <Text fontWeight="500">{q.text}</Text>
                  </Flex>
                </Box>
              ))}
            </VStack>
          </Flex>
        )}

        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {/* Premium loading animation */}
        {loading && (
          <Flex justify="flex-start" mb={3} className="msg-bot">
            <Flex
              rounded="2xl"
              roundedBottomLeft="lg"
              px={5}
              py={3.5}
              gap={1.5}
              align="center"
              className="shadow-premium"
              css={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(232, 184, 61, 0.15)',
                borderLeft: '3px solid #e8b83d',
              }}
            >
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  w="8px"
                  h="8px"
                  rounded="full"
                  css={{
                    background: 'linear-gradient(135deg, #1a8f5c, #0d5c3a)',
                  }}
                  animation={`pulse 1.2s ease-in-out ${i * 0.2}s infinite`}
                />
              ))}
            </Flex>
          </Flex>
        )}

        <div ref={bottomRef} />
      </Box>
    </Box>
  )
}
