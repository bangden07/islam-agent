/* ── ChatBubble — Premium Islamic message bubble ── */

import { useState } from 'react'
import { Box, Flex, Text, IconButton, Image } from '@chakra-ui/react'
import type { Message } from '../types/chat'
import { Citations } from './Citations.tsx'

interface Props {
  message: Message
}

const ShareIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
)

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

/* Bot avatar — mini mosque */
const BotAvatar = () => (
  <Flex
    align="center"
    justify="center"
    w={8}
    h={8}
    rounded="lg"
    flexShrink={0}
    mt={0.5}
    css={{
      background: 'linear-gradient(135deg, #0d5c3a, #073822)',
      boxShadow: '0 2px 8px rgba(13, 92, 58, 0.25)',
    }}
  >
    <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
      <path
        d="M20 8C20 8 14 13 14 18V19.5H12.5V29H16V25C16 23 18 21.5 20 21.5C22 21.5 24 23 24 25V29H27.5V19.5H26V18C26 13 20 8 20 8Z"
        fill="white" opacity="0.9"
      />
      <rect x="11" y="29" width="18" height="2" rx="0.5" fill="white" opacity="0.6" />
      <circle cx="20" cy="15" r="1" fill="#e8b83d" opacity="0.9" />
    </svg>
  </Flex>
)

export function ChatBubble({ message }: Props) {
  const isUser = message.role === 'user'
  const [shared, setShared] = useState(false)

  const handleShare = async () => {
    const plainText = message.content
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/^#{1,3} /gm, '')
      .replace(/^> /gm, '')
      .trim()

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Islam Agent', text: plainText })
        return
      } catch { /* cancelled */ }
    }

    try {
      await navigator.clipboard.writeText(plainText)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch { /* failed */ }
  }

  return (
    <Flex
      justify={isUser ? 'flex-end' : 'flex-start'}
      mb={3.5}
      gap={2}
      className={isUser ? 'msg-user' : 'msg-bot'}
    >
      {/* Bot avatar */}
      {!isUser && <BotAvatar />}

      <Box
        maxW="80%"
        px={4}
        py={3}
        position="relative"
        className="shadow-premium"
        {...(isUser
          ? {
              rounded: '2xl',
              roundedBottomRight: 'lg',
              color: 'white',
              css: {
                background: 'linear-gradient(135deg, #12754a 0%, #0d5c3a 100%)',
              },
            }
          : {
              rounded: '2xl',
              roundedBottomLeft: 'lg',
              color: 'gray.800',
              css: {
                background: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(232, 184, 61, 0.12)',
                borderLeft: '3px solid #e8b83d',
              },
            })}
      >
        {/* User image attachment */}
        {isUser && message.imageUrl && (
          <Box mb={message.content && message.content !== '(gambar)' ? 2.5 : 0}>
            <Image
              src={message.imageUrl}
              alt="Gambar dikirim"
              maxH="200px"
              rounded="xl"
              objectFit="cover"
              css={{
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            />
          </Box>
        )}

        {/* Content */}
        {(!isUser || (message.content && message.content !== '(gambar)')) && (
          <Box
            fontSize="sm"
            lineHeight="1.7"
            css={{
              '& h2': {
                fontSize: '1.1rem',
                fontWeight: 700,
                marginBottom: '0.4em',
                marginTop: '0.6em',
                color: isUser ? 'white' : '#073822',
              },
              '& h3': {
                fontSize: '1rem',
                fontWeight: 700,
                marginBottom: '0.3em',
                marginTop: '0.5em',
                color: isUser ? 'white' : '#0a4a2f',
              },
              '& h4': {
                fontSize: '0.95rem',
                fontWeight: 600,
                marginBottom: '0.2em',
                color: isUser ? 'white' : '#0d5c3a',
              },
              '& strong': {
                fontWeight: 700,
                color: isUser ? 'white' : '#073822',
              },
              '& blockquote': {
                borderLeft: isUser
                  ? '3px solid rgba(255,255,255,0.3)'
                  : '3px solid #e8b83d',
                paddingLeft: '0.75em',
                margin: '0.5em 0',
                fontStyle: 'italic',
                opacity: 0.9,
                fontFamily: "'Amiri', serif",
              },
              '& li': {
                marginLeft: '1.2em',
                listStyleType: 'disc',
                marginBottom: '0.2em',
              },
              '& a': {
                color: isUser ? '#a3dfc1' : '#1a8f5c',
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
              },
            }}
            dangerouslySetInnerHTML={{ __html: simpleMarkdown(message.content) }}
          />
        )}

        {!isUser && message.citations && message.citations.length > 0 && (
          <Citations citations={message.citations} />
        )}

        {!isUser && message.disclaimer && message.disclaimer.length > 0 && (
          <Text
            fontSize="xs"
            mt={2.5}
            fontStyle="italic"
            lineHeight="1.5"
            css={{
              color: 'rgba(0, 0, 0, 0.4)',
            }}
          >
            {message.disclaimer}
          </Text>
        )}

        {/* Footer: share + time */}
        <Flex mt={1.5} justify="space-between" align="center">
          {!isUser && (
            <IconButton
              aria-label={shared ? 'Tersalin!' : 'Bagikan'}
              variant="ghost"
              size="xs"
              rounded="lg"
              color={shared ? 'brand.600' : 'gray.400'}
              _hover={{ color: 'brand.700', bg: 'brand.50' }}
              onClick={handleShare}
            >
              {shared ? <CheckIcon /> : <ShareIcon />}
            </IconButton>
          )}

          <Text
            fontSize="2xs"
            textAlign="right"
            flex="1"
            fontWeight="500"
            css={{
              color: isUser ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)',
            }}
          >
            {message.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </Flex>
      </Box>
    </Flex>
  )
}

/** Very simple markdown → HTML (headings, bold, italic, lists, blockquotes) */
function simpleMarkdown(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^[-•] (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\n/g, '<br/>')
}
