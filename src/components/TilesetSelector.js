import { useEffect, useState, useMemo } from 'react'
import { AbsoluteCenter, HStack, Select, Spacer } from '@chakra-ui/react'
import { tilesets, defaultTileset } from '@/core/texture-data'
import { fromSourceToDataURL } from '@/core/textures'
import { focusGameCanvas } from '@/core/game-canvas'
import FileSelectButton from '@/components/FileSelectButton'
import useDocument from '@/hooks/useDocument'
import * as Tileset from '@/core/components/tileset'

const TilesetSelector = ({}) => {
  const tileset = useDocument('tileset', 'world')
  const [selectedValue, setSelectedValue] = useState('')
  const [options, setOptions] = useState([])

  // Chamge current tileset
  useEffect(() => {
    const selectedTilesetName = tileset?.name ?? defaultTileset
    let _selectedValue = ''
    let _options = []
    for (const value of tilesets) {
      const label = value.split('/').slice(-1)[0].split('.')[0]
      _options.push(<option key={label} value={value}>{label}</option>)
      if (value === selectedTilesetName) {
        _selectedValue = value
      }
    }
    if (tileset?.blob) {
      _selectedValue = 'custom'
      _options.push(<option key='custom' value='custom'>{`(custom) ${tileset.name}`}</option>)
    }
    setSelectedValue(_selectedValue)
    setOptions(_options)
  }, [tileset])


  const _handleSelectTileset = (e => {
    const fileName = e.target.value
    if (tilesets.includes(fileName)) {
      Tileset.create('world', {
        blob: null,
        name: fileName,
        size: { width: 320, height: 32 },
      })
    }
    focusGameCanvas()
  })

  const _handleUploadTileset = async (fileObject) => {
    try {
      const { dataUrl, width, height } = await fromSourceToDataURL(URL.createObjectURL(fileObject))
      if (width === 320 && height === 32) {
        Tileset.create('world', {
          blob: dataUrl,
          name: fileObject.name,
          size: { width, height },
        })
      } else {
        Tileset.remove('world')
      }
    } catch (e) {
      Tileset.remove('world')
    }
    focusGameCanvas()
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
        <img src={tileset?.blob ?? tileset?.name ?? defaultTileset} style={imgStyle} alt='tileset-preview' />
        <span style={shortcutsStyle}>1234567890</span>
      </div>
      <Spacer />
      <Select
        size='sm'
        value={selectedValue}
        placeholder={null}
        onChange={(e) => _handleSelectTileset(e)}
      >
        {options}
      </Select>
      <FileSelectButton
        label='Upload Tileset'
        id='tileset-image'
        accept='image/*'
        onSelect={(fileObject) => _handleUploadTileset(fileObject)}
      />
    </HStack>
  )
}

export default TilesetSelector