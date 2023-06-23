import React, { useMemo } from 'react'
import useSWR from 'swr'
import { getFilenameExtensionFromUrl } from '@/core/utils/utils'

const fetcher = (...args) => fetch(...args).then(res => res.json())

const useApi = (route) => {
  const { data, error, isLoading } = useSWR(route, fetcher)
  const _error = data?.error ?? error ?? null
  if (_error) {
    console.warn(`useApi(${route}) error:`, _error)
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

const useRedirectUrl = (url) => {
  const extension = useMemo(() => getFilenameExtensionFromUrl(url), [url])
  const redirectUrl = useMemo(() => {
    if (typeof url == 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
      return `/api/geturl/${encodeURIComponent(url)}`
    }
    return url
  }, [url])

  return {
    redirectUrl,
  }
}

export {
  useApi,
  useDbRooms,
  useRedirectUrl,
}
