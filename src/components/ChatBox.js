import { useEffect, useState } from 'react'
import {
  Box,
  VStack, HStack,
  Spacer,
  Text,
  Input,
} from '@chakra-ui/react'
import {
  ArrowForwardIcon,
  DeleteIcon,
} from '@chakra-ui/icons'
import { useDocument } from '@/hooks/useDocument'
import { getRemoteStore } from '@/core/singleton'
import useRoom from '@/hooks/useRoom'
import useProfile from '@/hooks/useProfile'
import useVerida from '@/hooks/useVerida'
import usePermission from '@/hooks/usePermission'
import Markdown from '@/components/Markdown'

const ChatBox = () => {
  const { agentId } = useRoom();
  const { canEdit } = usePermission('world')

  const { profileName } = useProfile(agentId)
  const { veridaProfileName } = useVerida()

  const [message, setMessage] = useState('')

  const document = useDocument('document', 'chat')

  useEffect(() => {
  }, [])

  const _onDump = () => {
    if (!canEdit) return
    let newDocument = {
      content: '',
    }
    getRemoteStore().setDocument('document', 'chat', newDocument)
  }

  const _onSubmit = () => {
    const name = veridaProfileName ?? profileName ?? 'You'
    const line = `**${name}**: ${message}\n\n`
    let newDocument = {
      content: '',
      ...document
    }
    newDocument.content += line
    getRemoteStore().setDocument('document', 'chat', newDocument)
    setMessage('')
  }

  return (
    <VStack className='ChatDrawer' h='700'>
      <Box className='ChatRow' align='center'>
        <HStack>
          <b>PUBLIC CHAT</b>
          <Spacer />
          {canEdit &&
            <DeleteIcon className='Clickable' onClick={() => _onDump()} />
          }
        </HStack>
      </Box>

      <Box className='ChatContent' overflowY='scroll'>
        <Markdown className=''>
          {document?.content ?? ''}
        </Markdown>
      </Box>

      <Box className='ChatRow'>
        <HStack>
          <Input
            size='xs'
            placeholder=''
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { if (e.code == 'Enter') _onSubmit() }}
          />
          <ArrowForwardIcon className='Clickable' onClick={() => _onSubmit()} />
        </HStack>
      </Box>
    </VStack>
  )
}

export default ChatBox
