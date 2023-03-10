import React from 'react'
import {
  HStack,
  VStack,
  Spacer,
  Divider,
  Checkbox,
  Text,
  Box,
} from '@chakra-ui/react'
import { useRoomContext } from '@/hooks/RoomContext'
import usePermission from '@/hooks/usePermission'
import useVerida from '@/hooks/useVerida'
import { useVeridaPublicProfile } from '@/hooks/useVeridaProfile'
import { Avatar } from '@/components/Avatar'

export const PermissionsForm = ({
  type,
  name,
  id,
  disabled = false,
}) => {
  const { Permission } = useRoomContext()
  const { veridaIsConnected, veridaProfile, did, didAddress } = useVerida()

  const { permission, isOwner, canEdit } = usePermission(id)
  const { veridaProfileName, veridaAvatarUri, veridaProfileUrl } = useVeridaPublicProfile(permission?.owner);

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
          <Avatar
            name={veridaProfileName ?? '...'}
            avatarUri={veridaAvatarUri ?? null}
            externalProfileUrl={veridaProfileUrl}
          />

          <VStack align='stretch'>
            <Text>{type}: {name}</Text>
            <Text>Document id: {id}</Text>
            {type == 'Room' &&
              <Text>Owner: {permission?.owner ?? <span className='Important'>Unclaimed</span>}</Text>
            }
            {!veridaIsConnected &&
              <Text>(connect to Verida for user profile)</Text>
            }
          </VStack>
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
