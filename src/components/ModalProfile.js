import React, { useState, useEffect, useRef } from 'react'
import {
  VStack,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  Spacer, Flex,
  Text,
} from '@chakra-ui/react'
import { useDocument } from '@/hooks/useDocument'
import useProfile from '@/hooks/useProfile'
import useVerida from '@/hooks/useVerida'
import useRoom from '@/hooks/useRoom'
import Button from '@/components/Button'
import { Avatar } from '@/components/Avatar'
import { getGameCanvasElement } from '@/core/game-canvas'

const ModalProfile = ({
  disclosure,
}) => {
  const { agentId } = useRoom()

  const { isOpen, onOpen, onClose } = disclosure
  const nameRef = useRef()
  const finalRef = useRef(null)

  const { profileName, profileImageUrl, defaultImageUrl } = useProfile(agentId)

  const { connect, disconnect, inviteFriend, veridaIsConnected, veridaIsConnecting, avatarName, did } = useVerida()

  useEffect(() => {
    finalRef.current = getGameCanvasElement()
  }, [])

  const disabled = (veridaIsConnecting || veridaIsConnecting)

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
          User Profile
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>
          <HStack>
            <Avatar width={100} />
            <VStack>
              <Text>{avatarName ?? profileName}</Text>
            </VStack>
          </HStack>
        </ModalBody>
        <ModalFooter>

          {(veridaIsConnecting || veridaIsConnected) ?
            <>
              <Button disabled={disabled} size='sm' onClick={() => disconnect()}>
                Disconnect Verida
              </Button>
              &nbsp;
              <Button disabled={disabled} size='sm' onClick={() => inviteFriend()}>
                Invite Friend
              </Button>
            </>
            :
            <>
              <Button disabled={disabled} size='sm' onClick={() => connect()}>
                {veridaIsConnecting ? 'Connecting' : 'Connect with Verida'}
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
