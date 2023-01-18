import { useEffect, useState, useMemo } from 'react'
import { HStack, Select, Spacer } from '@chakra-ui/react'
import { spritesheets, defaultSpritesheet } from '../core/texture-data'
import { getSprite } from '../core/textures'
import { deepMerge } from '../core/utils'

const CharacterSelector = ({
  profile,
  onSelect,
}) => {
  const [selectedValue, setSelectedValue] = useState('')
  const [imageName, setImageName] = useState(null)
  const [imageStyle, setImageStyle] = useState({})
  const [options, setOptions] = useState([])

  useEffect(() => {
    let _imageName = profile?.spritesheet ?? defaultSpritesheet.src
    let _selectedValue = ''
    let _options = []
    for (const sheet of spritesheets) {
      const src = sheet.src;
      const label = src.split('/').slice(-1)[0].split('.')[0]
      _options.push(<option key={label} value={src}>{label}</option>)
      if (src === _imageName) {
        _selectedValue = src
      }
    }
    // if (profile?.blob) {
    //   _imageName = profile.blob
    //   _selectedValue = 'custom'
    //   _options.push(<option key='custom' value='custom'>{`(custom) ${profile.spritesheet}`}</option>)
    // }

    let _imageStyle = {
      imageRendering: 'pixelated',
      width: '100%',
      height: '100%',
    }
    if (_imageName) {
      const sprite = getSprite(_imageName);
      if (sprite) {
        _imageStyle = deepMerge(_imageStyle, sprite.imgStyle);
      }
    }

    setSelectedValue(_selectedValue)
    setImageName(_imageName)
    setImageStyle(_imageStyle);
    setOptions(_options)
  }, [profile?.spritesheet])

  const _onChange = (e) => {
    const value = e.target.value
    onSelect?.(value)
  }

  const containerStyle = {
    width: '32px',
    height: '32px',
    // border: '0.5px solid gray',
  }

  return (
    <HStack>
      <div style={containerStyle}>
        <img src={imageName} style={imageStyle} alt='spritesheet-preview' />
      </div>
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
