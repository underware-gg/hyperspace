import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/router'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  HStack,
  Spacer,
  Text,
  Input,
  Box,
  VStack,
} from '@chakra-ui/react'
import { getLocalStore, getRemoteStore } from '@/core/singleton'
import { getGameCanvasElement } from '@/core/game-canvas'
import { useDocument, useLocalDocument } from '@/hooks/useDocument'
import usePermission from '@/hooks/usePermission'
import Button from '@/components/Button'
import Editable from '@/components/Editable'
import { TileField } from '@/components/ModalSettings'
import { PermissionsForm } from '@/components/PermissionsForm'
import * as Trigger from '@/core/components/trigger'

const ModalTrigger = ({
  triggerId,
  disclosure,
}) => {
  const { isOpen, onOpen, onClose } = disclosure

  const { permission, isOwner, canEdit, canView } = usePermission(triggerId)
  const trigger = useDocument('trigger', triggerId)

  const [data, setData] = useState([]);

  const initialFocusRef = useRef(null)
  const finalRef = useRef(null)

  useEffect(() => {
    finalRef.current = getGameCanvasElement()
  }, [])

  useEffect(() => {
    setData(trigger?.data ? JSON.parse(trigger.data) : [])
  }, [trigger])

  const _renameTrigger = (value) => {
    if (value && value != '') {
      Trigger.updateTrigger(triggerId, {
        name: value,
      })
    }
  }

  const _onChanged = (value) => {
    if (value) {
      const _data = [value]
      console.log(`SET:`, trigger, '+', _data)
      setData(_data)
    }
  }


  const _save = () => {
    if (data) {
      const _data = JSON.stringify(data)
      Trigger.updateTrigger(triggerId, {
        data: _data,
      })
    }
    onClose()
  }
  return (
    <Modal
      initialFocusRef={initialFocusRef}
      finalFocusRef={finalRef}
      isOpen={isOpen}
      onClose={() => onClose()}
      isCentered
      size='xl'
    >
      <ModalOverlay />
      <ModalContent
        maxW='56rem'
        backgroundColor='#000a'
      >
        <ModalHeader>
          <HStack>
            <Text>Trigger:</Text>
            {trigger?.name
              ? <Editable currentValue={trigger.name} onSubmit={(value) => _renameTrigger(value)} />
              : <Text color='important'>???</Text>
            }
            <Spacer />
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4} minHeight='300px'>
          <Tabs isFitted variant='enclosed'>
            <TabList mb='1em'>
              <Tab _selected={{ bg: 'teal' }}>Edit</Tab>
              <Tab _selected={{ bg: 'teal' }}>Permissions</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <MapTileSwitch data={data[0] ?? {}} onChanged={_onChanged} />
              </TabPanel>
              <TabPanel>
                <PermissionsForm
                  type={'Trigger'}
                  name={trigger?.name ?? '???'}
                  id={triggerId}
                  disabled={trigger == null}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Text>trigger id: {triggerId}</Text>
          <Spacer />
          <Button
            variant='outline'
            value='Save'
            onClick={() => _save()}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalTrigger


const MapTileSwitch = ({
  data,
  onChanged,
  disabled = false
}) => {
  const [x, setX] = useState(data.x ?? 0);
  const [y, setY] = useState(data.y ?? 0);
  const [validTile, setValidTile] = useState(true);

  const [stateOff, setStateOff] = useState(data.stateOff ?? 5);
  const [stateOn, setStateOn] = useState(data.stateOn ?? 5);

  const _validTile = (t) => (parseInt(t) >= 0 && parseInt(t) < 10)

  const validated = useMemo(() => (validTile
    && _validTile(stateOff)
    && _validTile(stateOn)
  ), [validTile, x, y, stateOn, stateOff])

  useEffect(() => {
    let result = null
    if (validated) {
      result = {
        type: 'map',
        x: parseInt(x),
        y: parseInt(y),
        stateOff: parseInt(stateOff),
        stateOn: parseInt(stateOn),
      }
    }
    onChanged(result)
  }, [validated, x, y, stateOn, stateOff])

  return (
    <div>
      <TileField
        name='Tile'
        valueX={x}
        valueY={y}
        onChangeX={setX}
        onChangeY={setY}
        onValidated={setValidTile}
      >
        <Text>OFF:</Text>
        <Input
          focusBorderColor={_validTile(stateOff) ? 'teal.500' : 'crimson'}
          placeholder=''
          value={stateOff}
          disabled={disabled}
          onChange={(e) => setStateOff(e.target.value)}
        />
        <Text>ON:</Text>
        <Input
          focusBorderColor={_validTile(stateOn) ? 'teal.500' : 'crimson'}
          placeholder=''
          value={stateOn}
          disabled={disabled}
          onChange={(e) => setStateOn(e.target.value)}
        />

      </TileField>

    </div>
  )
}
