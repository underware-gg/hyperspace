import React, { useState, useEffect, useRef } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  VStack, HStack,
  Spacer, Flex,
  Input,
  Text,
  Box,
  Link,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { getGameCanvasElement } from '@/core/game-canvas'
import { useDocument } from '@/hooks/useDocument'
import useProfile from '@/hooks/useProfile'
import useVerida from '@/hooks/useVerida'
import useRoom from '@/hooks/useRoom'
import CharacterSelector from '@/components/CharacterSelector'
import Editable from '@/components/Editable'
import Button from '@/components/Button'
import { Avatar } from '@/components/Avatar'
import * as Profile from '@/core/components/profile'

const ModalProfile = ({
  disclosure,
}) => {
  const { agentId } = useRoom()

  const { isOpen, onOpen, onClose } = disclosure
  const nameRef = useRef()
  const finalRef = useRef(null)

  const { profileName, profileAvatarUrl, profileCharacterUrl } = useProfile(agentId)

  const {
    connect, disconnect, inviteFriend,
    veridaIsConnected, veridaIsConnecting,
    hasVeridaProfile, veridaProfileName, veridaAvatarUri, veridaProfileUrl,
  } = useVerida()

  useEffect(() => {
    finalRef.current = getGameCanvasElement()
  }, [])

  const _renameUser = (value) => {
    Profile.update(agentId, {
      name: value,
    })
  }

  const disabled = (veridaIsConnecting)

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose()}
      initialFocusRef={nameRef}
      finalFocusRef={finalRef}
      isCentered
      size='lg'
    >
      <ModalOverlay />
      <ModalContent
        backgroundColor='#000a'
      >
        <ModalHeader>
          User Profile {hasVeridaProfile && '(Verida)'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>
          <HStack>
            <Avatar width={120}
              avatarUri={veridaAvatarUri ?? profileAvatarUrl}
              spriteUrl={profileCharacterUrl}
              externalProfileUrl={veridaProfileUrl}
            />
            <Box style={{ height: '120px' }}>
              <HStack>
                <Text>User Name:</Text>
                <Editable
                  currentValue={veridaProfileName ?? profileName ?? '...'}
                  onSubmit={(value) => _renameUser(value)}
                  disabled={hasVeridaProfile}
                />
                {hasVeridaProfile &&
                  <Link href={veridaProfileUrl} isExternal>
                    <ExternalLinkIcon mx='2px' />
                  </Link>
                }
              </HStack>

              <HStack>
                <Text>Character:</Text>
                <CharacterSelector />
              </HStack>

              <Text>
                Agent ID: {agentId}
              </Text>

            </Box>
          </HStack>
        </ModalBody>
        <ModalFooter>

          {veridaIsConnected ?
            <>
              <Button disabled={disabled} size='sm' onClick={() => inviteFriend()}>
                Invite Friend
              </Button>
              &nbsp;
              <Button disabled={disabled} size='sm' onClick={() => disconnect()}>
                Disconnect
              </Button>
            </>
            :
            <>
              <Button disabled={disabled} size='sm' onClick={() => window.open('https://www.verida.io/', '_blank', 'noreferrer')}>
                Download Verida
              </Button>
              &nbsp;
              <Button disabled={disabled} size='sm' onClick={() => connect()}>
                {veridaIsConnecting ? 'Connecting' : 'Connect'}
              </Button>
            </>
          }

          <Spacer />
          <Button
            variant='outline'
            value='Close'
            onClick={() => onClose()}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalProfile
