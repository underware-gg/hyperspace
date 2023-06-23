import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  HStack, VStack,
  Text,
  Spacer,
  Input,
  useDisclosure,
} from '@chakra-ui/react'
import {
  validateRoomSlug,
} from 'hyperbox-sdk'
import { makeRoute } from '@/core/utils/routes'
import { useSlugs } from '@/hooks/useSlugs'
import { useRoomContext } from '@/hooks/RoomContext'
import { useDocument } from '@/hooks/useDocument'
import ModalRoomCreate from '@/components/ModalRoomCreate'
import ModalRoomSelector from '@/components/ModalRoomSelector'
import { Button } from '@/components/Button'

const ModalRoomSwitcher = ({
  isOpen,
  handleClose,
}) => {
  const router = useRouter()
  const { room } = useRoomContext()
  const [newBranch, setNewBranch] = useState('')
  const { slug, branch, branchName, isMain, isLocal, serverDisplay } = useSlugs()
  const _branchClass = (!isMain && !isLocal) ? 'Important' : null

  const disclosureNewRoom = useDisclosure()
  const disclosureSelectRoom = useDisclosure()

  const settings = useDocument('settings', 'world')

  // detect room change
  useEffect(() => {
    if (slug) {
      handleClose()
    }
  }, [slug, branch])

  useEffect(() => {
    if (isOpen) {
      setNewBranch('')
    }
    if (!isOpen) {
      disclosureNewRoom.onClose()
      disclosureSelectRoom.onClose()
    }
  }, [isOpen])

  const _switchBranch = (newBranch, forceRevert) => {
    const pathname = makeRoute({
      slug,
      branch: newBranch,
    })
    router.push({
      pathname,
      query: forceRevert ? { forceRevert } : {},
    })
  }

  const _revertRoom = () => {
    room.revertToSourceRoom()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      isCentered
      size='xl'
    >
      <ModalOverlay />
      <ModalContent
        w='700px'
        backgroundColor='#000a'
      >
        <ModalHeader>
          <Text>Room: <span className='Important'>{slug}</span></Text>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={4}>
          <Text>Server: {serverDisplay}</Text>

          <hr className='HR2' />
          <HStack>
            <Text>Current Branch:  <span className={_branchClass}>{branchName}</span></Text>
            <HStack className='Padded'>
              {branch != null &&
                <Button
                  size='xs'
                  value='Revert State from Main'
                  variant='outline'
                  onClick={() => _revertRoom()}
                />
              }
              {branch != null &&
                <Button
                  size='xs'
                  value='Open [Main]'
                  onClick={() => _switchBranch(null)}
                />
              }
              {!isLocal &&
                <Button
                  size='xs'
                  value='Open [Local]'
                  onClick={() => _switchBranch('local')}
                />
              }
            </HStack>
            <Spacer />
          </HStack>

          <Text>Creation Date: {settings?.timestamp ? (new Date(settings.timestamp)).toString() : '?'}</Text>

          <hr className='HR0' />

          <HStack>
            <Text>Use Branch:</Text>
            <Input
              size='xs'
              w='200px'
              placeholder={'enter branch'}
              value={newBranch}
              onChange={(e) => setNewBranch(e.target.value)}
              onKeyDown={(e) => { if (e.code == 'Enter') _switchBranch(newBranch) }}
            />
            <Button
              size='xs'
              fullWidth
              value='Join'
              disabled={!validateRoomSlug(newBranch)}
              onClick={() => _switchBranch(newBranch, false)}
            />
            <Button
              size='xs'
              fullWidth
              value='Revert and Join'
              variant='outline'
              disabled={!validateRoomSlug(newBranch)}
              onClick={() => _switchBranch(newBranch, true)}
            />
            <Spacer />
          </HStack>

          <hr className='HR0' />
          <Text>* Branches create Room clones, preserving the original</Text>

          <hr className='HR2' />
        </ModalBody>

        <ModalFooter>
          <HStack w='100%'>
            <Button
              size='sm'
              onClick={() => disclosureSelectRoom.onOpen()}
            >
              Open Another Room
            </Button>
            <Button
              size='sm'
              onClick={() => disclosureNewRoom.onOpen()}
            >
              Create New Room
            </Button>

            <Spacer />

            <Button
              variant='outline'
              fullWidth
              value='Close'
              onClick={handleClose}
            />
          </HStack>
        </ModalFooter>

        <ModalRoomCreate disclosure={disclosureNewRoom} />

        <ModalRoomSelector disclosure={disclosureSelectRoom} />

      </ModalContent>
    </Modal>
  )
}

export default ModalRoomSwitcher
