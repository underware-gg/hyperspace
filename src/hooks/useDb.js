
import useSWR from 'swr'

const fetcher = (...args) => fetch(...args).then(res => res.json())

const useDbRooms = (id) => {
  const { data, error, isLoading } = useSWR(`/api/db/rooms`, fetcher)
  return {
    rooms: (data && !error) ? data.filter(n => n) : [],
    isLoading,
    error
  }
}

export {
  useDbRooms
}
