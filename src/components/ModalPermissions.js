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
  Checkbox,
  Text,
  Box,
} from '@chakra-ui/react'
import usePermission from '@/hooks/usePermission'
import useVerida from '@/hooks/useVerida'
import useVeridaPublicProfile from '@/hooks/useVeridaPublicProfile'
import Button from '@/components/Button'
import { VeridaAvatar } from './VeridaLogin'
import * as Permission from '@/core/components/permission'


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
  const router = useRouter()
  const { slug } = router.query
  const { id, isOpen, onClose } = permissionsDisclosure

  return (
    <Modal
      // initialFocusRef={initialRef}
      // finalFocusRef={finalRef}
      isOpen={isOpen}
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
          <PermissionsForm type={type} name={slug} id={id} />
        </ModalBody>
        <ModalFooter>
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

export const PermissionsForm = ({
  type,
  name,
  id,
  disabled=false,
}) => {
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

  const isDisabled = (disabled || !id || !veridaIsConnected || !canEdit)

  return (
    <Box>
      <VStack align='stretch'>

        <HStack>
          <VStack align='stretch'>
            <Text>{type}: {name}</Text>
            <Text>Document id: {id}</Text>
            <Text>Owner: {permission?.owner ?? <span className='Important'>Unclaimed</span>}</Text>
            {!veridaIsConnected &&
              <Text>(connect to Verida for user profile)</Text>
            }
          </VStack>

          {publicProfile &&
          <>
            <Spacer />
            <VeridaAvatar profile={publicProfile} />
          </>
          }
        </HStack>

        <Divider />

        <Checkbox isChecked={permission?.visible ?? true} isDisabled={isDisabled} onChange={(e) => _canView(e.target.checked)}>
          Anyone can View
        </Checkbox>
        <Checkbox isChecked={permission?.public ?? true} isDisabled={isDisabled || permission?.visible === false} onChange={(e) => _canEdit(e.target.checked)}>
          Anyone can Edit
        </Checkbox>

        {!veridaIsConnected && <><Divider /><Text color='error'>Connect to Verida!</Text></>}
        {veridaIsConnected && !canEdit && <><Divider /><Text color='error'>Not the owner!</Text></>}

      </VStack>
    </Box>
  )
}
