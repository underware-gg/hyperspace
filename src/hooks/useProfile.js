import { useState, useEffect } from 'react'
import { useDocument } from '@/hooks/useDocument'
import { getFilenameFromUrl } from '@/core/utils'
import * as Player from '@/core/components/player'

const useProfile = (id) => {
  const profile = useDocument('profile', id)

  const [profileName, setProfileName] = useState(null)
  const [profileImageUrl, setProfileImageUrl] = useState(null)

  // const defaultImageUrl = '/nosignal_noise.gif'
  const defaultImageUrl = '/avatar.png'

  useEffect(() => {
    let texture = Player.getPlayerTexture(id)
    setProfileName(profile?.name ?? getFilenameFromUrl(texture?.src)?.split('.')[0] ?? '...')
    setProfileImageUrl(texture?.src ?? defaultImageUrl)
  }, [id, profile])

  return {
    profileName,
    profileImageUrl,
    defaultImageUrl,
  }
}

export default useProfile
