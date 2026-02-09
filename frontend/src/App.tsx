import { useEffect, useState } from 'react'
import { Box, Flex, Heading, Text, IconButton } from '@chakra-ui/react'
import { useChat } from './hooks/useChat'
import { useChatHistory } from './hooks/useChatHistory'
import { ChatWindow } from './components/ChatWindow'
import { ChatInput } from './components/ChatInput'
import { HistoryDrawer } from './components/HistoryDrawer'
import { AboutDrawer } from './components/AboutDrawer'

/* ── Inline SVG icons ── */
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="16" y2="12" /><line x1="3" y1="17" x2="21" y2="17" />
  </svg>
)

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

/* ── Mosque + Crescent SVG Logo ── */
const MosqueLogo = () => (
  <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
    {/* Crescent moon */}
    <path d="M20 3C20 3 18 3 17.5 3.5C15 6 16 10 19 11C16 10.5 14 8 14 5.5C14 4.5 14.5 3.5 15 3C12 5 11 9 13 12.5C15 16 19 17 22.5 15C26 13 27 9 25 5.5C24 4 22 3 20 3Z" fill="#e8b83d" opacity="0.9"/>
    {/* Dome */}
    <path d="M20 12C20 12 13 17 13 22V23.5H11V33H15V28C15 25.5 17.5 24 20 24C22.5 24 25 25.5 25 28V33H29V23.5H27V22C27 17 20 12 20 12Z" fill="currentColor" opacity="0.95"/>
    {/* Base */}
    <rect x="9" y="33" width="22" height="2.5" rx="1" fill="currentColor" opacity="0.7"/>
    {/* Door */}
    <path d="M18 33V29.5C18 28.5 19 27.5 20 27.5C21 27.5 22 28.5 22 29.5V33" fill="currentColor" opacity="0.3"/>
    {/* Minaret finial */}
    <circle cx="20" cy="19" r="1.2" fill="#e8b83d" opacity="0.8"/>
  </svg>
)

export default function App() {
  const { messages, loading, error, send, clear, setMessages } = useChat()
  const history = useChatHistory()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)

  useEffect(() => {
    if (messages.length > 0) {
      history.saveSession(messages)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

  const handleLoadSession = (id: string) => {
    const msgs = history.loadSession(id)
    if (msgs) setMessages(msgs)
  }

  const handleNewChat = () => {
    history.newChat()
    clear()
  }

  return (
    <Flex direction="column" h="100dvh" bg="bg.surface">
      {/* ── History Drawer ── */}
      <HistoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sessions={history.sessions}
        activeId={history.activeId}
        onSelect={handleLoadSession}
        onDelete={history.deleteSession}
        onNewChat={handleNewChat}
        onClearAll={history.clearAll}
      />

      {/* ── Premium Header ── */}
      <Box
        as="header"
        position="relative"
        overflow="hidden"
        flexShrink={0}
        css={{
          background: 'linear-gradient(135deg, #073822 0%, #0d5c3a 50%, #0a4a2f 100%)',
        }}
      >
        {/* Islamic geometric pattern overlay */}
        <Box
          position="absolute"
          inset={0}
          className="islamic-pattern"
          opacity={0.5}
          pointerEvents="none"
        />

        {/* Gold accent line at bottom */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          h="2px"
          css={{
            background: 'linear-gradient(90deg, transparent 0%, #e8b83d 20%, #f5d06e 50%, #e8b83d 80%, transparent 100%)',
          }}
        />

        <Flex
          align="center"
          justify="space-between"
          maxW="800px"
          mx="auto"
          px={4}
          py={3}
          position="relative"
          zIndex={1}
        >
          <Flex align="center" gap={3}>
            {/* History button */}
            <IconButton
              aria-label="Riwayat chat"
              variant="ghost"
              color="whiteAlpha.900"
              size="sm"
              rounded="lg"
              _hover={{ bg: 'whiteAlpha.100' }}
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo */}
            <Flex
              align="center"
              justify="center"
              w={10}
              h={10}
              rounded="xl"
              color="white"
              css={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(232, 184, 61, 0.25)',
              }}
            >
              <MosqueLogo />
            </Flex>

            <Box>
              <Heading
                size="md"
                fontWeight="700"
                lineHeight="1.2"
                color="white"
                letterSpacing="-0.01em"
              >
                Islam Agent
              </Heading>
              <Text fontSize="xs" color="whiteAlpha.700" fontWeight="500">
                Tanya Jawab Islami · Rujukan Terpercaya
              </Text>
            </Box>
          </Flex>

          <Flex gap={1}>
            {messages.length > 0 && (
              <IconButton
                aria-label="Percakapan baru"
                variant="ghost"
                color="whiteAlpha.900"
                size="sm"
                rounded="lg"
                _hover={{ bg: 'whiteAlpha.100' }}
                onClick={handleNewChat}
              >
                <PlusIcon />
              </IconButton>
            )}

            <IconButton
              aria-label="Tentang"
              variant="ghost"
              color="whiteAlpha.900"
              size="sm"
              rounded="lg"
              _hover={{ bg: 'whiteAlpha.100' }}
              onClick={() => setAboutOpen(true)}
            >
              <InfoIcon />
            </IconButton>
          </Flex>
        </Flex>
      </Box>

      {/* ── Chat area ── */}
      <ChatWindow messages={messages} loading={loading} onSend={send} />

      {/* ── Error banner ── */}
      {error && (
        <Box
          css={{
            background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)',
          }}
          color="red.700"
          px={4}
          py={2.5}
          fontSize="sm"
          textAlign="center"
          flexShrink={0}
          borderTop="1px solid"
          borderColor="red.100"
        >
          {error}
        </Box>
      )}

      {/* ── Input ── */}
      <ChatInput onSend={send} disabled={loading} />

      {/* ── Copyright ── */}
      <Box
        bg="bg.surface"
        py={1.5}
        textAlign="center"
        flexShrink={0}
      >
        <Text fontSize="2xs" color="gray.400" fontWeight="500">
          &copy; {new Date().getFullYear()} Bang Den · Islam Agent
        </Text>
      </Box>

      {/* ── About Drawer ── */}
      <AboutDrawer open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </Flex>
  )
}
