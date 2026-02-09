/* ── HistoryDrawer — Premium Islamic slide-out panel ── */

import { Box, Flex, Heading, IconButton, Text, VStack } from '@chakra-ui/react'
import type { ChatSession } from '../types/chat'

interface Props {
  open: boolean
  onClose: () => void
  sessions: ChatSession[]
  activeId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onNewChat: () => void
  onClearAll: () => void
}

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
)

const ChatIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
)

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} hari lalu`
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function HistoryDrawer({
  open,
  onClose,
  sessions,
  activeId,
  onSelect,
  onDelete,
  onNewChat,
  onClearAll,
}: Props) {
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

      {/* Drawer */}
      <Flex
        direction="column"
        position="fixed"
        top={0}
        left={0}
        h="100dvh"
        w="300px"
        maxW="85vw"
        zIndex={50}
        transform={open ? 'translateX(0)' : 'translateX(-100%)'}
        transition="transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)"
        css={{
          background: 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(20px)',
          boxShadow: '4px 0 32px rgba(0, 0, 0, 0.1)',
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
              Riwayat Chat
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
          {/* Gold line */}
          <Box
            h="2px"
            css={{
              background: 'linear-gradient(90deg, transparent, #e8b83d, transparent)',
            }}
          />
        </Box>

        {/* New chat */}
        <Box px={4} py={3}>
          <Flex
            as="button"
            w="full"
            align="center"
            gap={2}
            px={3}
            py={2.5}
            rounded="xl"
            fontWeight="600"
            fontSize="sm"
            cursor="pointer"
            transition="all 0.2s"
            css={{
              color: '#0d5c3a',
              background: 'rgba(13, 92, 58, 0.04)',
              border: '1px dashed rgba(13, 92, 58, 0.2)',
              '&:hover': {
                background: 'rgba(13, 92, 58, 0.08)',
                borderColor: 'rgba(232, 184, 61, 0.4)',
              },
            }}
            onClick={() => { onNewChat(); onClose() }}
          >
            <PlusIcon />
            Percakapan Baru
          </Flex>
        </Box>

        {/* Session list */}
        <VStack flex="1" overflowY="auto" px={4} py={1} gap={1} align="stretch">
          {sessions.length === 0 && (
            <Flex direction="column" align="center" mt={10} gap={2} opacity={0.5}>
              <ChatIcon />
              <Text fontSize="sm" color="gray.400" textAlign="center">
                Belum ada riwayat
              </Text>
            </Flex>
          )}

          {sessions.map((s) => {
            const isActive = s.id === activeId
            return (
              <Flex
                key={s.id}
                align="center"
                gap={2}
                px={3}
                py={2.5}
                rounded="xl"
                cursor="pointer"
                transition="all 0.15s"
                css={{
                  background: isActive ? 'rgba(13, 92, 58, 0.06)' : 'transparent',
                  borderLeft: isActive ? '3px solid #e8b83d' : '3px solid transparent',
                  '&:hover': {
                    background: isActive ? 'rgba(13, 92, 58, 0.08)' : 'rgba(0, 0, 0, 0.02)',
                  },
                }}
                onClick={() => { onSelect(s.id); onClose() }}
              >
                <Box flex="1" overflow="hidden">
                  <Text fontSize="sm" fontWeight={isActive ? '600' : '500'} lineClamp={1} color="gray.800">
                    {s.title}
                  </Text>
                  <Text fontSize="2xs" color="gray.400" fontWeight="500">
                    {formatDate(s.updatedAt)} · {s.messages.length} pesan
                  </Text>
                </Box>
                <IconButton
                  aria-label="Hapus"
                  variant="ghost"
                  size="xs"
                  color="gray.300"
                  rounded="lg"
                  _hover={{ color: 'red.500', bg: 'red.50' }}
                  onClick={(e) => { e.stopPropagation(); onDelete(s.id) }}
                >
                  <TrashIcon />
                </IconButton>
              </Flex>
            )
          })}
        </VStack>

        {/* Clear all */}
        {sessions.length > 0 && (
          <Box px={4} py={3} css={{ borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
            <Flex
              as="button"
              w="full"
              align="center"
              justify="center"
              gap={1.5}
              py={2}
              rounded="xl"
              fontSize="xs"
              fontWeight="600"
              cursor="pointer"
              transition="all 0.15s"
              css={{
                color: '#ef4444',
                '&:hover': { background: 'rgba(239, 68, 68, 0.06)' },
              }}
              onClick={onClearAll}
            >
              <TrashIcon />
              Hapus semua riwayat
            </Flex>
          </Box>
        )}
      </Flex>
    </>
  )
}
