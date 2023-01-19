import { useEffect, useState, useMemo } from 'react'
import { AbsoluteCenter, HStack, Select, Spacer } from '@chakra-ui/react'
import { tilesets, defaultTileset } from '../core/texture-data'

const TilesetSelector = ({
  customTileset,
  onSelect,
}) => {
  const [selectedValue, setSelectedValue] = useState('')
  const [options, setOptions] = useState([])

  useEffect(() => {
    const selectedTilesetName = customTileset?.name ?? defaultTileset
    let _selectedValue = ''
    let _options = []
    for (const value of tilesets) {
      const label = value.split('/').slice(-1)[0].split('.')[0]
      _options.push(<option key={label} value={value}>{label}</option>)
      if (value === selectedTilesetName) {
        _selectedValue = value
      }
    }
    if (customTileset?.blob) {
      _selectedValue = 'custom'
      _options.push(<option key='custom' value='custom'>{`(custom) ${customTileset.name}`}</option>)
    }
    setSelectedValue(_selectedValue)
    setOptions(_options)
  }, [customTileset])

  const _onChange = (e) => {
    const value = e.target.value
    if (tilesets.includes(value)) {
      onSelect?.(value)
    }
  }

  const imgStyle = {
    minWidth: '320px',
    width: '320px',
    height: '32px',
    position: 'relative',
    textAlign: 'center',
    padding: '0',
  }
  const shortcutsStyle = {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: '12px',
    left: '12px',
    letterSpacing: '23px',
    textShadow: '0.1em 0.1em black',
    userSelect: 'none',
  }


  return (
    <HStack>
      <div style={imgStyle}>
        <img src={customTileset?.blob ?? customTileset?.name ?? defaultTileset} style={imgStyle} alt='tileset-preview' />
        <span style={shortcutsStyle}>1234567890</span>
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

export default TilesetSelector
