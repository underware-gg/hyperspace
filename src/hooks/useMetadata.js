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
    const _copyMetadata = (metadata) => ({
      ...(metadata ?? {}),
      metadata: metadata?.metadata ? JSON.parse(metadata.metadata) : {}
    })
    return {
      realm: _copyMetadata(realmMetadata),
      chamber: _copyMetadata(chamberMetadata),
      agent: _copyMetadata(agentMetadata),
    }
  }, [realmMetadata, chamberMetadata, agentMetadata])

  const prettyMetadata = useMemo(() => stringify(metadata, null, 2, {
    offset: 0
  }), [metadata])
  const agentArtUrl = useMemo(() => (metadata?.agent?.artUrl ?? null), [metadata])

  useEffect(() => {
    if (Screen && screenId && prettyMetadata) {
      Screen.updateScreen(screenId, {
        content: prettyMetadata,
        img: agentArtUrl,
      })
    }
  }, [Screen, screenId, prettyMetadata, agentArtUrl])

  return {
    slug, isQuest,
    metadata,
    prettyMetadata,
  }
}

export {
  useMetadata,
}