import React, { useState, useEffect, useRef } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  VStack, HStack,
  Spacer, Flex,
  Text,
  Box,
  Link,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { useRoomContext } from '@/hooks/RoomContext'
import { useVeridaContext } from '@/hooks/VeridaContext'
import useGameCanvas from '@/hooks/useGameCanvas'
import useProfile from '@/hooks/useProfile'
import CharacterSelector from '@/components/CharacterSelector'
import Editable from '@/components/Editable'
import Button from '@/components/Button'
import { Avatar } from '@/components/Avatar'
import { VeridaConnectMenu } from '@/components/Verida'

const ModalProfile = ({
  disclosure,
}) => {
  const { agentId, Profile } = useRoomContext()
  const { gameCanvas } = useGameCanvas()
  const { isOpen, onOpen, onClose } = disclosure
  const { profileName, profileAvatarUrl, profileCharacterUrl } = useProfile()
  const nameRef = useRef()
  const finalRef = useRef()

  useEffect(() => {
    if (isOpen) {
      finalRef.current = gameCanvas
    }
  }, [isOpen])

  const {
    hasVeridaProfile, veridaProfileName, veridaAvatarUri, veridaProfileUrl,
  } = useVeridaContext()

  const _renameUser = (value) => {
    Profile.updateProfile(agentId, {
      name: value,
    })
  }

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
          <VeridaConnectMenu disconnectButton={true} inviteFriendButton={true} />
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
