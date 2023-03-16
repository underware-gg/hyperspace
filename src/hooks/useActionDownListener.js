import { useEffect } from 'react'
import { useRoomContext } from '@/hooks/RoomContext'

const useActionDownListener = (eventName, callback = () => { }) => {
  const { actions } = useRoomContext()
  useEffect(() => {
    if (!actions) return
    actions.addActionDownListener(eventName, callback)
    return () => {
      actions.removeActionDownListener(eventName, callback)
    }
  }, [])

  return { emitter: actions?.emitAction ?? null }
}

export default useActionDownListener
