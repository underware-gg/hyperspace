import { useEffect, useState, useMemo } from 'react'
import { HStack, Select, Spacer } from '@chakra-ui/react'
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
      const label = value.split('/').slice(-1)
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

  return (
    <HStack>
      <img src={customTileset?.blob ?? customTileset?.name ?? defaultTileset} alt='tileset-preview' />
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

export default TilesetSelector
