/* ── AboutDrawer — Premium Islamic about panel ── */

import { Box, Flex, Heading, IconButton, Text, VStack } from '@chakra-ui/react'

interface Props {
  open: boolean
  onClose: () => void
}

const APP_VERSION = '2.0.0'

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

/* Logo SVG */
const LogoLarge = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M20 3C20 3 18 3 17.5 3.5C15 6 16 10 19 11C16 10.5 14 8 14 5.5C14 4.5 14.5 3.5 15 3C12 5 11 9 13 12.5C15 16 19 17 22.5 15C26 13 27 9 25 5.5C24 4 22 3 20 3Z" fill="#e8b83d" opacity="0.9"/>
    <path d="M20 12C20 12 13 17 13 22V23.5H11V33H15V28C15 25.5 17.5 24 20 24C22.5 24 25 25.5 25 28V33H29V23.5H27V22C27 17 20 12 20 12Z" fill="white" opacity="0.95"/>
    <rect x="9" y="33" width="22" height="2.5" rx="1" fill="white" opacity="0.7"/>
    <circle cx="20" cy="19" r="1.2" fill="#e8b83d" opacity="0.8"/>
  </svg>
)

const FEATURES = [
  { icon: '📖', text: 'Rujukan Al-Qur\'an dengan teks Arab Utsmani' },
  { icon: '🔍', text: 'Web search fallback untuk topik di luar KB' },
  { icon: '🖼️', text: 'Analisis gambar dengan Gemini AI Vision' },
  { icon: '🎙️', text: 'Input suara (Speech-to-Text)' },
  { icon: '💬', text: 'Riwayat percakapan tersimpan' },
  { icon: '📚', text: '45 dokumen knowledge base Islam komprehensif' },
  { icon: '⚖️', text: 'Perspektif utama Madzhab Syafi\'i + perbandingan' },
]

export function AboutDrawer({ open, onClose }: Props) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <Box
          position="fixed"
          inset={0}
          zIndex={40}
          onClick={onClose}
          css={{
            background: 'rgba(7, 56, 34, 0.3)',
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Panel */}
      <Flex
        direction="column"
        position="fixed"
        top={0}
        right={0}
        h="100dvh"
        w="340px"
        maxW="90vw"
        zIndex={50}
        transform={open ? 'translateX(0)' : 'translateX(100%)'}
        transition="transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)"
        css={{
          background: 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(20px)',
          boxShadow: '-4px 0 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Header with gradient */}
        <Box
          position="relative"
          overflow="hidden"
          css={{
            background: 'linear-gradient(135deg, #073822, #0d5c3a)',
          }}
        >
          <Box
            position="absolute"
            inset={0}
            className="islamic-pattern"
            opacity={0.4}
          />
          <Flex
            align="center"
            justify="space-between"
            px={4}
            py={3.5}
            position="relative"
          >
            <Heading size="sm" fontWeight="700" color="white">
              Tentang Aplikasi
            </Heading>
            <IconButton
              aria-label="Tutup"
              variant="ghost"
              size="sm"
              color="whiteAlpha.800"
              rounded="lg"
              _hover={{ bg: 'whiteAlpha.100' }}
              onClick={onClose}
            >
              <CloseIcon />
            </IconButton>
          </Flex>
          <Box
            h="2px"
            css={{
              background: 'linear-gradient(90deg, transparent, #e8b83d, transparent)',
            }}
          />
        </Box>

        {/* Content */}
        <VStack flex="1" overflowY="auto" px={5} py={6} gap={5} align="stretch">
          {/* App icon + name */}
          <Flex direction="column" align="center" gap={3}>
            <Flex
              align="center"
              justify="center"
              w={18}
              h={18}
              rounded="2xl"
              css={{
                background: 'linear-gradient(135deg, #0d5c3a, #073822)',
                boxShadow: '0 4px 20px rgba(13, 92, 58, 0.3)',
                animation: 'glowPulse 3s ease-in-out infinite',
              }}
            >
              <LogoLarge />
            </Flex>
            <Box textAlign="center">
              <Heading
                size="lg"
                fontWeight="800"
                letterSpacing="-0.02em"
                css={{ color: '#073822' }}
              >
                Islam Agent
              </Heading>
              <Text
                fontSize="xs"
                fontWeight="600"
                mt={0.5}
                css={{
                  color: '#c9952a',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Versi {APP_VERSION}
              </Text>
            </Box>
          </Flex>

          {/* Description */}
          <Box
            px={4}
            py={3.5}
            rounded="xl"
            css={{
              background: 'rgba(13, 92, 58, 0.04)',
              border: '1px solid rgba(13, 92, 58, 0.08)',
            }}
          >
            <Text fontSize="sm" color="gray.700" lineHeight="1.7">
              <strong>Islam Agent</strong> adalah aplikasi tanya jawab Islami berbasis AI
              yang memberikan jawaban dengan rujukan dari Al-Qur&apos;an, Hadis,
              dan kitab-kitab ulama terpercaya.
            </Text>
          </Box>

          {/* Features */}
          <Box>
            <Text fontWeight="700" fontSize="sm" mb={3} css={{ color: '#073822' }}>
              Fitur Utama
            </Text>
            <VStack gap={2} align="stretch">
              {FEATURES.map((f, i) => (
                <Flex
                  key={i}
                  align="center"
                  gap={3}
                  fontSize="sm"
                  color="gray.600"
                  px={3}
                  py={2}
                  rounded="lg"
                  transition="all 0.15s"
                  css={{
                    '&:hover': { background: 'rgba(13, 92, 58, 0.03)' },
                  }}
                >
                  <Text fontSize="md" flexShrink={0}>{f.icon}</Text>
                  <Text lineHeight="1.4">{f.text}</Text>
                </Flex>
              ))}
            </VStack>
          </Box>

          {/* Knowledge Base */}
          <Box>
            <Text fontWeight="700" fontSize="sm" mb={2} css={{ color: '#073822' }}>
              Sumber Referensi
            </Text>
            <Text fontSize="xs" color="gray.500" lineHeight="1.7">
              Al-Qur&apos;an (Rasm Utsmani), Kutub Sittah (Bukhari, Muslim, Abu Dawud,
              Tirmidzi, Nasa&apos;i, Ibnu Majah), kitab-kitab fikih Syafi&apos;iyah,
              dengan perbandingan madzhab lainnya jika relevan.
            </Text>
          </Box>

          {/* Tech */}
          <Box>
            <Text fontWeight="700" fontSize="sm" mb={2} css={{ color: '#073822' }}>
              Teknologi
            </Text>
            <Text fontSize="xs" color="gray.500" lineHeight="1.7">
              React + TypeScript + Chakra UI · Capacitor (Android) · FastAPI ·
              DigitalOcean Gradient™ AI Platform · Google Gemini
            </Text>
          </Box>

          {/* Disclaimer */}
          <Box
            px={4}
            py={3.5}
            rounded="xl"
            css={{
              background: 'rgba(232, 184, 61, 0.06)',
              border: '1px solid rgba(232, 184, 61, 0.15)',
            }}
          >
            <Text fontSize="xs" color="gray.600" lineHeight="1.7" fontStyle="italic">
              <strong>Disclaimer:</strong> Aplikasi ini adalah alat bantu referensi.
              Untuk kepastian hukum syar&apos;i, mohon merujuk langsung kepada ulama
              dan ustadz yang terpercaya.
            </Text>
          </Box>
        </VStack>

        {/* Copyright */}
        <Box
          px={5}
          py={4}
          textAlign="center"
          css={{
            borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          }}
        >
          <Text fontSize="xs" color="gray.400" fontWeight="500">
            &copy; {new Date().getFullYear()} Bang Den. All rights reserved.
          </Text>
        </Box>
      </Flex>
    </>
  )
}
