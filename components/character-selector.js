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
    const selectedSpritesheetName = profile?.spritesheet ?? defaultSpritesheet
    let _selectedValue = ''
    let _options = []
    for (const value of spritesheets) {
      const label = value.split('/').slice(-1)
      _options.push(<option key={label} value={value}>{label}</option>)
      if (value === selectedSpritesheetName) {
        _selectedValue = value
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
    if (spritesheets.includes(value)) {
      onSelect?.(value)
    }
  }

  const style = {
    width: '32px',
    height: '32px',
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
