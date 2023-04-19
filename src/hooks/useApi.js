
import useSWR from 'swr'

const fetcher = (...args) => fetch(...args).then(res => res.json())

const useApi = (route) => {
  const { data, error, isLoading } = useSWR(route, fetcher)
  const _error = data?.error ?? error ?? null
  if (_error) {
    console.warn(`ueApi(${route}) error:`, _error)
    return {
      data: null,
      error: _error,
      isLoading,
    }
  }
  return { data, error, isLoading }
}

const useDbRooms = (id, includeSession = false) => {
  const { data, error, isLoading } = useApi(`/api/db/rooms`)
  const _filter = (v) => (v && (includeSession || !v.includes(':')))
  return {
    rooms: (data && !error) ? data.filter(_filter) : [],
    isLoading,
    error,
  }
}

const useGetUrl = (url) => {
  const { data, error, isLoading } = useApi(`/api/geturl/${url}`)
  return {
    rooms: (data && !error) ? data.filter(n => n) : [],
    isLoading,
    error,
  }
}

export {
  useDbRooms,
  useGetUrl,
}
