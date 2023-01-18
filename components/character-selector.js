import { useEffect, useState, useMemo } from 'react'
import { HStack, Select, Spacer } from '@chakra-ui/react'
import { spritesheets, defaultSpritesheet } from '../core/texture-data'

const CharacterSelector = ({
  profile,
  onSelect,
}) => {
  const [selectedValue, setSelectedValue] = useState('')
  const [options, setOptions] = useState([])

  useEffect(() => {
    const selectedSpritesheetName = profile?.spritesheet ?? defaultSpritesheet.src
    let _selectedValue = ''
    let _options = []
    for (const sheet of spritesheets) {
      const src = sheet.src;
      const label = src.split('/').slice(-1)
      _options.push(<option key={label} value={src}>{label}</option>)
      if (src === selectedSpritesheetName) {
        _selectedValue = src
      }
    }
    if (profile?.blob) {
      _selectedValue = 'custom'
      _options.push(<option key='custom' value='custom'>{`(custom) ${profile.spritesheet}`}</option>)
    }
    setSelectedValue(_selectedValue)
    setOptions(_options)
  }, [profile])

  const _onChange = (e) => {
    const value = e.target.value
    onSelect?.(value)
  }

  const style = {
    width: '32px',
    height: '32px',
    imageRendering: 'pixelated',
  }

  return (
    <HStack>
      <img src={profile?.blob ?? profile?.spritesheet ?? defaultSpritesheet} style={style} alt='spritesheet-preview' />
      <Spacer />
      <Select
        value={selectedValue}
        placeholder={null}
        onChange={(e) => _onChange(e)}
      >
        {options}
      </Select>
    </HStack>
  )
}

export default CharacterSelector
