import React from 'react'
import { useRouter } from 'next/router'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  HStack,
  VStack,
  Spacer,
  Divider,
  Text,
  Checkbox,
} from '@chakra-ui/react'
import usePermission from '@/hooks/usePermission'
import useVerida from '@/hooks/useVerida'
import useVeridaPublicProfile from '@/hooks/useVeridaPublicProfile'
import Button from '@/components/Button'
import { VeridaAvatar } from './VeridaLogin'
import * as Permission from '@/core/components/permission'

const _defaultOptions = {
  header: 'Action required',
  message: 'Confirm?',
  confirmLabel: 'OK',
  cancelLabel: 'Cancel',
  onConfirm: () => { },
  onCancel: () => { }
}

export const usePermissionsDisclosure = (id) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return {
    openPermissions: onOpen,
    isOpen, onClose,
    id,
  }
}

export const ModalPermissions = ({
  type,
  permissionsDisclosure,
}) => {
  const { id, isOpen, onClose } = permissionsDisclosure
  const { veridaIsConnected, veridaProfile, did, didAddress } = useVerida()

  const { permission, isOwner, canEdit } = usePermission(id)
  const { publicProfile } = useVeridaPublicProfile(permission?.owner);

  const router = useRouter()
  const { slug } = router.query

  const _canView = (value) => {
    Permission.updatePermission(id, didAddress, {
      visible: value,
    })
  }

  const _canEdit = (value) => {
    Permission.updatePermission(id, didAddress, {
      public: value,
    })
  }

  const isDisabled = (!veridaIsConnected || !canEdit)

  return (
    <Modal
      // initialFocusRef={initialRef}
      // finalFocusRef={finalRef}
      isOpen={isOpen}
      // onAfterOpen={() => _onAfterOpen()}
      onClose={onClose}
      isCentered
      size='lg'
    >
      <ModalOverlay />
      <ModalContent
        backgroundColor='#000a'
      >
        <ModalHeader>
          Edit {type} Permissions
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>
          <VStack align='stretch'>

            <HStack>
              <VStack align='stretch'>
                <Text>Room: {slug}</Text>
                <Text>Document id: {id}</Text>
                <Text>Owner: {permission?.owner ?? 'Unclaimed'}</Text>
                {!veridaIsConnected &&
                  <Text>(connect to Verida for user profile)</Text>
                }
              </VStack>
              
              {publicProfile &&
                <VeridaAvatar profile={publicProfile} />
              }
            </HStack>

            <Divider />
            
            <Checkbox isChecked={permission?.visible ?? true} isDisabled={true} onChange={(e) => _canView(e.target.checked)}>
              Anyone can View
            </Checkbox>
            <Checkbox isChecked={permission?.public ?? true} isDisabled={isDisabled} onChange={(e) => _canEdit(e.target.checked)}>
              Anyone can Edit
            </Checkbox>

          </VStack>
        </ModalBody>
        <ModalFooter>
          {!veridaIsConnected && <>Connect to Verida!</>}
          {veridaIsConnected && !canEdit && <>Not the owner!</>}
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
