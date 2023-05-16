import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { SyncIcon } from '@/components/Icons'

const useSlugs = () => {
  const router = useRouter()
  const { route } = router
  const { slugs, forceRevert } = router.query
  const isDocument = route?.startsWith('/document/') ?? false

  const [slug, key, documentName] = useMemo(() => {
    if (isDocument && slugs?.length == 2) {
      // catch: /document/slug/documentName
      return [slugs[0], undefined, slugs[1]]
    }
    // catch: /slug
    // catch: /slug/key
    // catch: /document/slug/key/documentName
    return slugs ?? []
  }, [slugs, isDocument])

  const isMain = slug && !key
  const isLocal = slug && (key?.toLowerCase() === 'local')
  const inSync = slug && !isLocal
  const serverName = !slug ? '?' : inSync ? 'funDAOmental' : 'Local'
  const serverDisplay = <span>{serverName} <SyncIcon inSync={inSync} /></span>

  return {
    slug: slug ?? null,
    key: key ?? null,
    keyName: isMain ? '[Main]' : isLocal ? '[Local] (Private)' : (key ?? 'Main'),
    documentName: documentName ?? null,
    forceRevert: (forceRevert === 'true'),
    serverName,
    serverDisplay,
    inSync,
    isMain,
    isLocal,
  }
}

export { useSlugs }
