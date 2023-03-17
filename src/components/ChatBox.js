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
import { useRoomContext } from '@/hooks/RoomContext'
import { useDocument } from '@/hooks/useDocument'
import { useVeridaContext } from '@/hooks/VeridaContext'
import useProfile from '@/hooks/useProfile'
import usePermission from '@/hooks/usePermission'
import Markdown from '@/components/Markdown'

const ChatBox = () => {
  const { agentId, remoteStore } = useRoomContext()
  const { canEdit, canView } = usePermission('world')

  const { profileName } = useProfile(agentId)
  const { veridaProfileName } = useVeridaContext()

  const [message, setMessage] = useState('')

  const document = useDocument('document', 'chat')

  useEffect(() => {
  }, [])

  const _onDump = () => {
    if (!canEdit || !remoteStore) return
    let newDocument = {
      content: '',
    }
    remoteStore.setDocument('document', 'chat', newDocument)
  }

  const _onSubmit = () => {
    if (!canView || !remoteStore) return
    const name = veridaProfileName ?? profileName ?? 'You'
    const line = `**${name}**: ${message}\n\n`
    let newDocument = {
      content: '',
      ...document
    }
    newDocument.content += line
    remoteStore.setDocument('document', 'chat', newDocument)
    setMessage('')
  }

  return (
    <VStack className='ChatDrawer'>
      <Box className='ChatRow' align='center'>
        <HStack>
          <b>ROOM CHAT</b>
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
            placeholder={canView ?'':'no permission'}
            value={message}
            disabled={!canView}
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
