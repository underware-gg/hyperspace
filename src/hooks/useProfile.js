import { useState, useEffect } from 'react'
import { useRoomContext } from '@/hooks/RoomContext'
import { useLocalDocument, useAgentDocument } from '@/hooks/useDocument'
import { getFilenameFromUrl } from '@/core/utils'

const useProfile = (id = null) => {
  const { agentId } = useRoomContext()
  const { Player } = useRoomContext()
  const [profileName, setProfileName] = useState(null)
  const [characterName, setCharacterName] = useState(null)
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(null)
  const [profileCharacterUrl, setProfileCharacterUrl] = useState(null)

  const _agentId = id ?? agentId

  const wallet = useLocalDocument('profileWallet', _agentId)
  const _profileId = wallet?.profileId ?? _agentId

  const profile = useAgentDocument('profile', _profileId)

  useEffect(() => {
    if (Player && _profileId) {
      let texture = Player.getPlayerTexture(_profileId)
      setProfileName(profile && profile.name != '' ? profile.name : null)
      setCharacterName(getFilenameFromUrl(texture?.src)?.split('.')[0] ?? null)
      // TODO: Extract PFP from texture
      // setProfileAvatarUrl(texture?.src ?? null)
      setProfileCharacterUrl(texture?.src ?? null)
    }
  }, [id, profile, Player])

  return {
    profileId: _profileId,
    walletType: wallet?.walletType ?? null,
    profileName: profileName ?? characterName ?? '...',
    profileAvatarUrl,
    profileCharacterUrl,
    view3d: profile?.view3d ?? false,
  }
}

export default useProfile
