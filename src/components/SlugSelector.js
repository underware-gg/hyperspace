import React, { useMemo, useState } from 'react'
import {
  Select,
  Text,
  Box,
} from '@chakra-ui/react'
import { useDbRooms } from '@/hooks/useDb'

const SlugSelector = ({
  selectedValue,
  onChange,
}) => {
  const { rooms } = useDbRooms()

  const options = useMemo(() => {
    let result = []
    for (const slug of rooms) {
      result.push(<option key={slug} value={slug}>{slug}</option>)
    }
    return result
  }, [rooms])

  return (
    <Select
      // size='sm'
      value={selectedValue}
      placeholder='Slug'
      onChange={(e) => onChange(e.target.value)}
    >
      {options}
    </Select>
  )
}

export default SlugSelector
