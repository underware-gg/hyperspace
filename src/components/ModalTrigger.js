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
import useTrigger from '@/hooks/useTrigger'
import usePermission from '@/hooks/usePermission'
import Button from '@/components/Button'
import Editable from '@/components/Editable'
import { TileInput, ValidatedInput, useInputValidator } from '@/components/Inputs'
import { PermissionsForm } from '@/components/PermissionsForm'
import * as Trigger from '@/core/components/trigger'

const ModalTrigger = ({
  triggerId,
  disclosure,
}) => {
  const { isOpen, onOpen, onClose } = disclosure

  const { permission, isOwner, canEdit, canView } = usePermission(triggerId)
  const { trigger, data } = useTrigger(triggerId)
  const [newData, setNewData] = useState([]);

  const initialFocusRef = useRef(null)
  const finalRef = useRef(null)

  useEffect(() => {
    finalRef.current = getGameCanvasElement()
  }, [])

  useEffect(() => {
    setNewData(data)
  }, [data])

  const _renameTrigger = (value) => {
    if (value && value != '') {
      Trigger.updateTrigger(triggerId, {
        name: value,
      })
    }
  }

  const _onChanged = (value) => {
    if (value) {
      console.log(`SET:`, trigger, '+', [value])
      setNewData([value])
    }
  }

  const _save = () => {
    Trigger.updateTrigger(triggerId, {
      data: JSON.stringify(newData),
    })
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


const _tileIndexToNumber = (value) => {
  return value == 10 ? 0 : value + 1
}
const _tileNumberToIndex = (value) => {
  let tile = parseInt(value)
  if (tile == 0) tile = 10
  return tile - 1
}

const MapTileSwitch = ({
  data,
  onChanged,
  disabled = false
}) => {
  const validator = useInputValidator()
  const [x, setX] = useState(data.x ?? 0);
  const [y, setY] = useState(data.y ?? 0);
  const [stateOff, setStateOff] = useState(_tileIndexToNumber(data.stateOff ?? 4));
  const [stateOn, setStateOn] = useState(_tileIndexToNumber(data.stateOn ?? 4));

  useEffect(() => {
    let result = null
    if (validator.isValid) {
      result = {
        type: 'map',
        x: parseInt(x),
        y: parseInt(y),
        stateOff: _tileNumberToIndex(stateOff),
        stateOn: _tileNumberToIndex(stateOn),
      }
    }
    onChanged(result)
  }, [x, y, stateOn, stateOff])

  return (
    <div>
      <TileInput
        name='Tile'
        valueX={x}
        valueY={y}
        onChangeX={setX}
        onChangeY={setY}
        validator={validator}
      >
        <Text>OFF:</Text>
        <ValidatedInput
          value={stateOff}
          maxValue={9}
          disabled={disabled}
          onChange={setStateOff}
          validator={validator}
        />
        <Text>ON:</Text>
        <ValidatedInput
          value={stateOn}
          maxValue={9}
          disabled={disabled}
          onChange={setStateOn}
          validator={validator}
        />
      </TileInput>

    </div>
  )
}
