import { useState, useEffect } from 'react'
import { useRoomContext } from '@/hooks/RoomContext'
import { useDocument } from '@/hooks/useDocument'
import { getFilenameFromUrl } from '@/core/utils'

const useProfile = (id) => {
  const { Player } = useRoomContext()
  const [profileName, setProfileName] = useState(null)
  const [characterName, setCharacterName] = useState(null)
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(null)
  const [profileCharacterUrl, setProfileCharacterUrl] = useState(null)

  const profile = useDocument('profile', id)

  useEffect(() => {
    if (!Player) return
    let texture = Player.getPlayerTexture(id)
    setProfileName(profile && profile.name != '' ? profile.name : null)
    setCharacterName(getFilenameFromUrl(texture?.src)?.split('.')[0] ?? null)
    // TODO: Extract PFP from texture
    // setProfileAvatarUrl(texture?.src ?? null)
    setProfileCharacterUrl(texture?.src ?? null)
  }, [id, profile, Player])

  return {
    profileName: profileName ?? characterName ?? '...',
    profileAvatarUrl,
    profileCharacterUrl,
  }
}

export default useProfile
