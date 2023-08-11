import React, { useEffect, useMemo } from 'react'
import {
  validateRoomSlug,
} from 'hyperbox-sdk'
import { getServerUrl, isProductionServer } from '@/core/utils/config'
import { useRouter } from 'next/router'
import { SyncIcon } from '@/components/Icons'
import { validateSlug } from '@rsodre/crawler-data'

const useSlugs = () => {
  const router = useRouter()
  const { route } = router
  const { slugs, forceRevert } = router.query
  const isRoom = route?.startsWith('/room/') ?? false
  const isQuest = route?.startsWith('/endlessquest/') ?? false
  const isDocument = route?.startsWith('/document/') ?? false

  useEffect(() => console.log(`route, router.query:`, route, router.query), [router.query])

  const [slug, branch, documentName] = useMemo(() => {
    if (!slugs || slugs.length == 0) {
      // catch: /room/?slug=<slug>&branch=<branch>
      return [router.query.slug, router.query.branch, undefined]
    }
    if (isDocument && slugs.length == 2) {
      // catch: /document/<slug>/<documentName>
      return [slugs[0], undefined, slugs[1]]
    }
    // catch: /room/<slug>
    // catch: /room/<slug>/<branch>
    // catch: /document/<slug>/<branch>/<documentName>
    return slugs
  }, [router.query, slugs, isDocument])

  const isMain = slug && !branch
  const isLocal = slug && (branch?.toLowerCase() === 'local')
  const inSync = slug && !isLocal
  const serverUrl = getServerUrl()
  const serverName = isLocal ? 'None' : (isProductionServer() ? 'funDAOmental' : 'Custom')
  const serverDisplay = <span>{serverName} <SyncIcon inSync={inSync} /></span>
  const slugIsValid = (validateRoomSlug(slug) && (!branch || validateRoomSlug(branch)))
  const isCrawlerSlug = slugIsValid && validateSlug(slug)
  const branchName = isMain ? '[Main]' : isLocal ? '[Local] (Private)' : branch ? (isQuest ? `Realm ${branch}` : branch) : 'Main'

  return {
    slug: slug ?? null,
    branch: branch ?? null,
    realmCoord: isQuest ? branch : null,
    branchName,
    documentName: documentName ?? null,
    forceRevert: (forceRevert === 'true'),
    slugIsValid,
    serverUrl,
    serverName,
    serverDisplay,
    inSync,
    isMain,
    isLocal,
    isDocument,
    isCrawlerSlug,
    isRoom: isRoom && slugIsValid,
    isQuest: isQuest && isCrawlerSlug,
  }
}

export { useSlugs }
