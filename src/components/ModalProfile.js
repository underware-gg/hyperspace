import React, { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  VStack, HStack,
  Spacer, Flex,
  Text,
  Box,
  Link,
  Divider,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { useRoomContext } from '@/hooks/RoomContext'
import { useVeridaContext } from '@/hooks/VeridaContext'
import useGameCanvas from '@/hooks/useGameCanvas'
import useProfile from '@/hooks/useProfile'
import CharacterSelector from '@/components/CharacterSelector'
import Editable from '@/components/Editable'
import ConnectWalletButton from '@/web3/components/ConnectWalletButton'
import { VeridaConnectMenu } from '@/components/Verida'
import { Avatar } from '@/components/Avatar'
import { Address } from '@/components/Address'

const ModalProfile = ({
  disclosure,
}) => {
  const { agentId, Profile } = useRoomContext()
  const { gameCanvas } = useGameCanvas()
  const { isOpen, onOpen, onClose } = disclosure
  const { profileId, profileName, profileAvatarUrl, profileCharacterUrl } = useProfile()
  const nameRef = useRef()
  const finalRef = useRef()

  useEffect(() => {
    if (isOpen) {
      finalRef.current = gameCanvas
    }
  }, [isOpen])

  // Verida
  const {
    hasVeridaProfile, veridaProfileName, veridaAvatarUri, veridaProfileUrl,
    veridaIsConnected, didAddress,
  } = useVeridaContext()

  // Ethereum Wallet
  const { isConnected, address } = useAccount()

  const _renameUser = (value) => {
    Profile.updateCurrentProfile({
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
            <Box >
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

              <Text>
                Profile ID: {profileId}
              </Text>

            </Box>
          </HStack>

          <hr className='HR2' />
          <HStack>
            <VeridaConnectMenu disconnectButton={true} inviteFriendButton={true} />
            <Spacer />
            {veridaIsConnected &&
              <Address address={didAddress} />
            }
          </HStack>

          <hr className='HR2' />
          <HStack>
            <ConnectWalletButton />
            <Spacer />
            {isConnected &&
              <Address address={address} />
            }
          </HStack>

        </ModalBody>

        {/* <ModalFooter>
          <Spacer />
          <Button
            variant='outline'
            value='Close'
            onClick={() => onClose()}
          />
        </ModalFooter> */}

      </ModalContent>
    </Modal>
  )
}

export default ModalProfile
