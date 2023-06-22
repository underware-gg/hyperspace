import React, { useEffect, useState } from 'react'
import { HStack, Select, Spacer } from '@chakra-ui/react'
import { spritesheets } from '@/core/texture-data'
import { useRoomContext } from '@/hooks/RoomContext'
import useGameCanvas from '@/hooks/useGameCanvas'
import useProfile from '@/hooks/useProfile'
import useTexture from '@/hooks/useTexture'

const CharacterSelector = ({ }) => {
  const { Profile } = useRoomContext()
  const { profileCharacterUrl } = useProfile()
  const { gameCanvas } = useGameCanvas()

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
  }, [profileCharacterUrl])

  const _handleSelectSpritesheet = (e => {
    const fileName = e.target.value
    if (fileName) {
      Profile.updateCurrentProfile({
        spritesheet: fileName,
      })
    }
    gameCanvas?.focus()
  })

  const containerStyle = {
    width: '60px',
    height: '60px',
    margin: '0',
    // border: '0.5px solid gray',
  }

  return (
    <HStack>
      <div style={{ width: '120px' }}>
        <Select
          size='sm'
          value={selectedValue}
          placeholder={null}
          onChange={(e) => _handleSelectSpritesheet(e)}
        >
          {options}
        </Select>
      </div>
      <Spacer />
      <div style={containerStyle}>
        {sprite?.imgStyle &&
          <img src={profileCharacterUrl} style={sprite?.imgStyle} alt='sprite' />
        }
      </div>
    </HStack>
  )
}

export default CharacterSelector
