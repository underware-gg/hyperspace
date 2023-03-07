import React, { useMemo, useEffect } from 'react'
import {
  Select,
  Text,
  Box,
} from '@chakra-ui/react'
import { useDbRooms } from '@/hooks/useApi'

const SlugSelector = ({
  selectedValue,
  onChange,
  resetOnMount = true,
}) => {
  const { rooms } = useDbRooms()

  useEffect(() => {
    if (resetOnMount) {
      onChange('')
    }
  }, [])

  const options = useMemo(() => {
    let result = []
    for (const slug of rooms) {
      result.push(<option key={slug} value={slug}>{slug}</option>)
    }
    return result
  }, [rooms])

  return (
    <Select
      value={selectedValue ?? ''}
      placeholder='<document slug>'
      onChange={(e) => onChange(e.target.value)}
    >
      {options}
    </Select>
  )
}

export default SlugSelector
