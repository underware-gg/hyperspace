import React, { useState, useEffect } from 'react'
import { useRoomContext } from '@/hooks/RoomContext'
import { useLocalDocument, useAgentDocument } from '@/hooks/useDocument'
import { getFilenameFromUrl } from '@/core/utils'

const useProfile = () => {
  const { agentId, Profile } = useRoomContext()
  const [profileName, setProfileName] = useState(null)
  const [characterName, setCharacterName] = useState(null)
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(null)
  const [profileCharacterUrl, setProfileCharacterUrl] = useState(null)

  const agentProfile = useAgentDocument('wallet', agentId)
  const profileId = agentProfile?.profileId ?? agentId

  const profile = useAgentDocument('profile', profileId)
  const wallet = useLocalDocument('profileWallet', agentId)

  // console.log(`useProfile()`, agentId, profileId, wallet, profile)

  useEffect(() => {
    if (profileId && Profile) {
      let texture = Profile.getProfileTexture(profileId)
      setProfileName(profile && profile.name != '' ? profile.name : null)
      setCharacterName(getFilenameFromUrl(texture?.src)?.split('.')[0] ?? null)
      // TODO: Extract PFP from texture
      // setProfileAvatarUrl(texture?.src ?? null)
      setProfileCharacterUrl(texture?.src ?? null)
    }
  }, [profileId, profile, Profile])

  return {
    profileId,
    walletType: wallet?.walletType ?? null,
    profileName: profileName ?? characterName ?? '...',
    profileAvatarUrl,
    profileCharacterUrl,
    view3d: profile?.view3d ?? false,
  }
}

export default useProfile
