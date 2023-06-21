import React, { useState, useEffect, useRef } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  HStack,
  Spacer,
  Text,
} from '@chakra-ui/react'
import { useRoomContext } from '@/hooks/RoomContext'
import useGameCanvas from '@/hooks/useGameCanvas'
import useTrigger from '@/hooks/useTrigger'
import usePermission from '@/hooks/usePermission'
import { Button } from '@/components/Button'
import Editable from '@/components/Editable'
import { TileInput, ValidatedInput, useInputValidator } from '@/components/Inputs'
import { PermissionsForm } from '@/components/PermissionsForm'

const ModalTrigger = ({
  triggerId,
  disclosure,
}) => {
  const { Trigger } = useRoomContext()
  const { gameCanvas } = useGameCanvas()
  const { isOpen, onOpen, onClose } = disclosure

  const { permission, isOwner, canEdit, canView } = usePermission(triggerId)
  const { trigger, data } = useTrigger(triggerId)
  const [newData, setNewData] = useState([]);
  const validator = useInputValidator()

  const initialFocusRef = useRef(null)
  const finalRef = useRef()

  useEffect(() => {
    if (isOpen) {
      finalRef.current = gameCanvas
    }
  }, [isOpen])

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
                <MapTileSwitch data={data[0] ?? {}} onChanged={_onChanged} validator={validator} />
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
            disabled={!validator.isValid}
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
  disabled = false,
  validator,
}) => {
  const [x, setX] = useState(data.x ?? 0);
  const [y, setY] = useState(data.y ?? 0);
  const [stateOff, setStateOff] = useState(data.stateOff ?? 5);
  const [stateOn, setStateOn] = useState(data.stateOn ?? 5);

  useEffect(() => {
    let result = null
    if (validator.isValid) {
      result = {
        type: 'map2',
        x: parseInt(x),
        y: parseInt(y),
        stateOff,
        stateOn,
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
