import { useState, useEffect } from 'react'
import { useRoomContext } from '@/hooks/RoomContext'
import { useLocalDocument, useAgentDocument } from '@/hooks/useDocument'
import { getFilenameFromUrl } from '@/core/utils'

const useProfile = () => {
  const { agentId, Profile } = useRoomContext()
  const [profileName, setProfileName] = useState(null)
  const [characterName, setCharacterName] = useState(null)
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(null)
  const [profileCharacterUrl, setProfileCharacterUrl] = useState(null)

  const wallet = useLocalDocument('profileWallet', agentId)
  const _profileId = wallet?.profileId ?? agentId

  const profile = useAgentDocument('profile', _profileId)

  // console.log(`useProfile()`, agentId, _profileId, wallet, profile)

  useEffect(() => {
    if (_profileId && Profile) {
      let texture = Profile.getProfileTexture(_profileId)
      setProfileName(profile && profile.name != '' ? profile.name : null)
      setCharacterName(getFilenameFromUrl(texture?.src)?.split('.')[0] ?? null)
      // TODO: Extract PFP from texture
      // setProfileAvatarUrl(texture?.src ?? null)
      setProfileCharacterUrl(texture?.src ?? null)
    }
  }, [_profileId, profile, Profile])

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
