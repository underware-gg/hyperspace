import { useState, useEffect } from 'react'
import {
  addActionDownListener,
  removeActionDownListener,
  emitAction,
} from '@/core/controller'

const useActionDownListener = (eventName, callback=() => {}) => {
  useEffect(() => {
    addActionDownListener(eventName, callback)
    return () => {
      removeActionDownListener(eventName, callback)
    }
  }, [])

  return { emitter: emitAction }
}

export default useActionDownListener
