import React, { useEffect, useMemo } from 'react'
import { useSlugs } from '@/hooks/useSlugs'
import { useRoomContext } from '@/hooks/RoomContext'
import { useMetadataDocument } from '@/hooks/useDocument'
import { QuestMetadataDocBase, QuestRealmDoc, QuestChamberDoc, QuestAgentDoc } from 'hyperbox-sdk'
var stringify = require('json-stringify')

const useMetadata = (screenId) => {
  const { slug, realmCoord, isQuest } = useSlugs()
  const { Screen } = useRoomContext()

  const key = QuestMetadataDocBase.makeChamberKey(realmCoord, slug)

  const realmMetadata = useMetadataDocument(QuestRealmDoc.type, realmCoord)
  const chamberMetadata = useMetadataDocument(QuestChamberDoc.type, key)
  const agentMetadata = useMetadataDocument(QuestAgentDoc.type, key)

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
    slug,
    realmCoord,
    isQuest,
    metadata,
    prettyMetadata,
  }
}

export {
  useMetadata,
}