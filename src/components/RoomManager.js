import React, { useState } from 'react'
import {
  HStack, VStack,
  Spacer,
  Text,
} from '@chakra-ui/react'
import { SettingsIcon } from '@chakra-ui/icons'
import { useSlugs } from '@/hooks/useSlugs'
import ModalRoomSwitcher from '@/components/ModalRoomSwitcher'

const RoomManager = () => {
  const { slug, isMain, isLocal, branchName, serverDisplay } = useSlugs()
  const _branchClass = (!isMain && !isLocal) ? 'Important' : null

  const [showSwitcher, setShowSwitcher] = useState(false)

  return (
    <VStack h='100%' alignItems='left'>
      <HStack>
        <Text className='NoMargin'>Room: <span className='Important'>{slug}</span></Text>
        <Spacer />
        <SettingsIcon boxSize='0.8em' className='Clickable' onClick={() => setShowSwitcher(true)} />
      </HStack>
      <Text className='NoMargin'>Branch:  <span className={_branchClass}>{branchName}</span></Text>
      <Text className='NoMargin'>Server: {serverDisplay}</Text>
      <Spacer />
      <ModalRoomSwitcher
        isOpen={showSwitcher}
        handleClose={() => setShowSwitcher(false)}
      />
    </VStack>
  ) 
}

export default RoomManager
