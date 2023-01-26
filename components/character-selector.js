import { useEffect, useState } from 'react'
import { HStack, Select, Spacer, useTableStyles } from '@chakra-ui/react'
import { spritesheets, defaultSpritesheet } from '../core/texture-data'
import { deepMerge } from '../core/utils'
import useTexture from '../hooks/use-texture'
import { images } from 'next.config'

const CharacterSelector = ({
  profile,
  onSelect,
}) => {
  const [selectedValue, setSelectedValue] = useState('')
  const [imageName, setImageName] = useState(null)
  const [imageStyle, setImageStyle] = useState({ display: 'none' })
  const [options, setOptions] = useState([])
  const { sprite } = useTexture(imageName)

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

    setSelectedValue(_selectedValue)
    setImageName(_imageName)
    setOptions(_options)
  }, [profile?.spritesheet])

  useEffect(() => {
    if (sprite) {
      let _imageStyle = {
        imageRendering: 'pixelated',
        width: '100%',
        height: '100%',
      }
      _imageStyle = deepMerge(_imageStyle, sprite.imgStyle);
      setImageStyle(_imageStyle);
    }
  }, [sprite])

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
        size='sm'
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
