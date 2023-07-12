import React, { useEffect, useMemo } from 'react'
import { useSlugs } from '@/hooks/useSlugs'
import { useRoomContext } from '@/hooks/RoomContext'
import { useMetadataDocument } from '@/hooks/useDocument'
var stringify = require('json-stringify')

const useMetadata = (screenId) => {
  const { slug, isQuest } = useSlugs()
  const { Screen } = useRoomContext()

  const realmMetadata = useMetadataDocument('questRealm', '1')
  const chamberMetadata = useMetadataDocument('questChamber', slug)
  const agentMetadata = useMetadataDocument('questAgent', slug)

  const metadata = useMemo(() => {
    if (!isQuest) return null
    delete realmMetadata?.metadata
    delete chamberMetadata?.metadata
    delete agentMetadata?.metadata
    return {
      realm: { ...realmMetadata },
      chamber: { ...chamberMetadata },
      agent: { ...agentMetadata },
    }
  }, [realmMetadata, chamberMetadata, agentMetadata])

  const prettyMetadata = useMemo(() => stringify(metadata, null, 2, {
    offset: 0
  }), [metadata])

  useEffect(() => {
    if (screenId && prettyMetadata) {
      Screen.updateScreen(screenId, {
        content: prettyMetadata,
      })
    }
  }, [screenId, prettyMetadata])

  return {
    slug, isQuest,
    metadata,
    prettyMetadata,
  }
}

export {
  useMetadata,
}