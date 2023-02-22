import { useEffect, useState } from 'react'
import { HStack, Select, Spacer } from '@chakra-ui/react'
import { spritesheets } from '@/core/texture-data'
import { focusGameCanvas } from '@/core/game-canvas'
import { deepMerge } from '@/core/utils'
import useRoom from '@/hooks/useRoom'
import useProfile from '@/hooks/useProfile'
import useTexture from '@/hooks/useTexture'
import * as Profile from '@/core/components/profile'

const CharacterSelector = ({ }) => {
  const { agentId } = useRoom();
  const { profileCharacterUrl } = useProfile(agentId)

  const [selectedValue, setSelectedValue] = useState('')
  const [options, setOptions] = useState([])
  const { sprite } = useTexture(profileCharacterUrl ?? null)

  useEffect(() => {
    let _selectedValue = ''
    let _options = []
    for (const sheet of spritesheets) {
      const src = sheet.src;
      const label = src.split('/').slice(-1)[0].split('.')[0]
      _options.push(<option key={label} value={src}>{label}</option>)
      if (src === profileCharacterUrl) {
        _selectedValue = src
      }
    }

    // can be used for uploaded character in the future, see Tileset implementation
    // if (profile?.blob) {
    //   _imageName = profile.blob
    //   _selectedValue = 'custom'
    //   _options.push(<option key='custom' value='custom'>{`(custom) ${profile.spritesheet}`}</option>)
    // }

    setSelectedValue(_selectedValue)
    setOptions(_options)
  }, [agentId, profileCharacterUrl])

  const _handleSelectSpritesheet = (e => {
    const fileName = e.target.value
    if (agentId && fileName) {
      Profile.update(agentId, {
        spritesheet: fileName,
      })
    }
    focusGameCanvas()
  })

  const containerStyle = {
    width: '32px',
    height: '32px',
    // border: '0.5px solid gray',
  }

  return (
    <HStack>
      <div style={containerStyle}>
        {sprite?.imgStyle &&
          <img src={profileCharacterUrl} style={sprite?.imgStyle} alt='sprite' />
        }
      </div>
      <Spacer />
      <Select
        size='sm'
        value={selectedValue}
        placeholder={null}
        onChange={(e) => _handleSelectSpritesheet(e)}
      >
        {options}
      </Select>
    </HStack>
  )
}

export default CharacterSelector
