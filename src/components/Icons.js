import React from 'react'
import {
  Tooltip,
} from '@chakra-ui/react'
import { RepeatIcon } from '@chakra-ui/icons'

const SyncIcon = ({
  inSync,
}) => {
  const _label = inSync ? 'In Sync' : 'No Sync'
  const _color = inSync ? 'important' : '#444'
  return (
    <Tooltip label={_label} bg={_color}>
      <RepeatIcon color={_color} />
    </Tooltip>
  )
}

export {
  SyncIcon,
}
