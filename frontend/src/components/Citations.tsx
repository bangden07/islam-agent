/* ── Citations — Premium expandable references ── */

import { useState } from 'react'
import { Box, Flex, Text, VStack } from '@chakra-ui/react'
import type { Citation } from '../types/chat'

interface Props {
  citations: Citation[]
}

const BookIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
)

const LinkIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

export function Citations({ citations }: Props) {
  const [open, setOpen] = useState(false)

  if (citations.length === 0) return null

  // Check if sources are web URLs (from web search fallback)
  const isWeb = citations.some((c) => c.source.startsWith('http'))

  return (
    <Box
      mt={3}
      pt={2.5}
      css={{
        borderTop: '1px solid rgba(232, 184, 61, 0.15)',
      }}
    >
      <Box
        as="button"
        display="flex"
        alignItems="center"
        gap={1.5}
        fontSize="xs"
        fontWeight="600"
        cursor="pointer"
        rounded="lg"
        px={2}
        py={1}
        transition="all 0.15s"
        css={{
          color: '#0d5c3a',
          '&:hover': {
            background: 'rgba(13, 92, 58, 0.06)',
          },
        }}
        onClick={() => setOpen(!open)}
      >
        <BookIcon />
        <Text>{citations.length} rujukan</Text>
        <Text
          transition="transform 0.2s"
          css={{
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
          }}
        >
          ▾
        </Text>
      </Box>

      {open && (
        <VStack
          gap={2}
          mt={2}
          align="stretch"
          css={{ animation: 'fadeInUp 0.25s ease' }}
        >
          {citations.map((c, i) => (
            <Box
              key={i}
              px={3}
              py={2.5}
              rounded="lg"
              fontSize="xs"
              css={{
                background: 'rgba(13, 92, 58, 0.03)',
                border: '1px solid rgba(13, 92, 58, 0.08)',
                transition: 'all 0.15s',
                '&:hover': {
                  background: 'rgba(13, 92, 58, 0.06)',
                  borderColor: 'rgba(232, 184, 61, 0.2)',
                },
              }}
            >
              <Flex align="center" gap={1.5}>
                {isWeb && (
                  <Box color="gold.500" flexShrink={0}>
                    <LinkIcon />
                  </Box>
                )}
                <Text fontWeight="600" color="brand.800" lineClamp={1}>
                  {c.title || c.source}
                </Text>
              </Flex>
              {c.title && c.source && (
                <Text
                  color="brand.600"
                  mt={0.5}
                  lineClamp={1}
                  css={{
                    opacity: 0.7,
                    fontSize: '0.68rem',
                  }}
                >
                  {c.source}
                </Text>
              )}
              {c.snippet && (
                <Text color="gray.500" mt={1} lineHeight="1.5" lineClamp={2}>
                  {c.snippet}
                </Text>
              )}
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  )
}
