import React, { useState, useEffect, useMemo } from 'react'
import { useRemoteDocument } from '@/hooks/useDocument'

const useTrigger = (id) => {
  const trigger = useRemoteDocument('trigger', id)
  const data = useMemo(() => trigger?.data ? JSON.parse(trigger.data) : [], [trigger])

  return {
    trigger,
    data,
  }
}

export default useTrigger
