import { useMemo } from 'react'
import useLocalStorageState from 'use-local-storage-state'

const _noSerializer = {
  stringify: (s) => (s),
  parse: (s) => (s),
}

const useLocalStorageValue = (key, serialize = true) => {
  const options = useMemo(() => ({ serializer: serialize ? JSON : _noSerializer }), [serialize])
  const [value, setValue] = useLocalStorageState(key, options)
  return {
    [key]: value,
  }
}

export {
  useLocalStorageValue
}
