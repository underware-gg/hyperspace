import React, { useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import {
  HStack,
  Input,
  Text,
} from '@chakra-ui/react'
import { useDocument } from '@/hooks/useDocument'
import { defaultSettings } from '@/core/components/settings'

const useInputValidator = () => {
  const [inputs, setInputs] = useState({})
  const [isValid, setIsValid] = useState(true)

  const onValidated = (id, validated) => {
    inputs[id] = validated
    setInputs({ ...inputs })
  }

  const onUnmounted = (id) => {
    delete inputs[id]
    setInputs({ ...inputs })
  }

  useEffect(() => {
    const _isValid = Object.values(inputs).filter(v => v == false).length == 0
    // console.log(`______isValid`, _isValid, inputs)
    setIsValid(_isValid)
  }, [inputs])

  return {
    onValidated,
    onUnmounted,
    isValid,
  }
}

const ValidatedInput = ({
  value,
  minValue = 0,
  maxValue = 1,
  disabled = false,
  onChange = (value) => { },
  validator,
}) => {
  const [id, setId] = useState(null)
  const [isValid, setIsValid] = useState(true)
  const { onValidated, onUnmounted } = validator

  useEffect(() => {
    const _id = nanoid()
    setId(_id)
    return () => {
      onUnmounted(_id)
    }
  }, [])

  useEffect(() => {
    if (id) {
      const _valid = (value !== '' && !isNaN(value) && value >= minValue && value <= maxValue)
      setIsValid(_valid)
      onValidated(id, _valid)
    }
  }, [value, id])

  const _onChange = (value) => {
    const v = parseInt(value)
    onChange(!isNaN(v) ? v : value)
  }

  return (
    <Input
      focusBorderColor={isValid ? 'teal.500' : 'crimson'}
      errorBorderColor={'crimson'}
      isInvalid={!isValid}
      placeholder=''
      value={value}
      disabled={disabled}
      onChange={(e) => _onChange(e.target.value)}
    />
  )
}



const TileInput = ({
  name = 'Tile',
  valueX,
  valueY,
  minX = 1,
  minY = 1,
  maxX = null,
  maxY = null,
  disabled = false,
  onChangeX = (value) => { },
  onChangeY = (value) => { },
  validator,
  children,
}) => {

  const settings = useDocument('settings', 'world') ?? defaultSettings

  return (
    <HStack>
      <Text w='220px'>{name}</Text>
      <Text>X:</Text>
      <ValidatedInput
        value={valueX}
        minValue={minX}
        maxValue={maxX ?? settings?.size?.width}
        disabled={disabled}
        onChange={onChangeX}
        validator={validator}
      />
      <Text>Y:</Text>
      <ValidatedInput
        value={valueY}
        minValue={minY}
        maxValue={maxY ?? settings?.size?.height}
        disabled={disabled}
        onChange={onChangeY}
        validator={validator}
      />
      {children}
    </HStack>
  )
}


export {
  useInputValidator,
  ValidatedInput,
  TileInput,
}