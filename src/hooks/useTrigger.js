import React, { useState, useEffect, useMemo } from 'react'
import { useDocument } from '@/hooks/useDocument'

const useTrigger = (id) => {
  const trigger = useDocument('trigger', id)
  const data = useMemo(() => trigger?.data ? JSON.parse(trigger.data) : [], [trigger])

  return {
    trigger,
    data,
  }
}

export default useTrigger
