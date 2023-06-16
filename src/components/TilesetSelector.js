import { useEffect, useState } from 'react'
import { HStack, Select, Spacer } from '@chakra-ui/react'
import { tilesets, defaultTileset } from '@/core/texture-data'
import { fromSourceToDataURL } from '@/core/textures'
import useGameCanvas from '@/hooks/useGameCanvas'
import FileSelectButton from '@/components/FileSelectButton'
import { useRoomContext } from '@/hooks/RoomContext'
import { useDocument } from '@/hooks/useDocument'
import usePermission from '@/hooks/usePermission'


const TilesetSelector = ({ }) => {
  const { Tileset } = useRoomContext()
  const { gameCanvas } = useGameCanvas()
  const { canEdit } = usePermission('world')
  const tileset = useDocument('tileset', 'world')
  const [selectedValue, setSelectedValue] = useState('')
  const [options, setOptions] = useState([])

  // Change current tileset
  useEffect(() => {
    const selectedTilesetName = tileset?.name ?? defaultTileset.src
    let _selectedValue = ''
    let _options = []
    for (const t of tilesets) {
      const src = t.src
      const label = src.split('/').slice(-1)[0].split('.')[0]
      _options.push(<option key={label} value={src}>{label}</option>)
      if (src === selectedTilesetName) {
        _selectedValue = src
      }
    }
    if (_selectedValue == '') {
      _options.push(<option key={'selected'} value={''}>custom</option>)
    }
    if (tileset?.blob) {
      _selectedValue = 'custom'
      _options.push(<option key='custom' value='custom'>{`(custom) ${tileset.name}`}</option>)
    }
    setSelectedValue(_selectedValue)
    setOptions(_options)
  }, [tileset?.name])

  const _handleSelectTileset = (e => {
    const fileName = e.target.value
    const src = tilesets[fileName]
    for (const t of tilesets) {
      const src = t.src
      if (fileName == src) {
        Tileset.updateTileset('world', fileName, 32, 32, null)
      }
    }
    gameCanvas?.focus()
  })

  const _handleUploadTileset = async (fileObject) => {
    try {
      const { dataUrl, width, height } = await fromSourceToDataURL(URL.createObjectURL(fileObject))
      if (width === 320 && height === 32) {
        Tileset.updateTileset('world', fileObject.name, width, height, dataUrl)
      } else {
        Tileset.remove('world')
      }
    } catch (e) {
      Tileset.remove('world')
    }
    gameCanvas?.focus()
  }

  const imgStyle = {
    minWidth: '320px',
    width: '320px',
    height: '32px',
    position: 'relative',
    textAlign: 'center',
    padding: '0',
  }
  const deleteStyle = {
    width: '32px',
    height: '32px',
    border: 'solid 1px gray',
    padding: '10px',
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
        <img src={tileset?.blob ?? tileset?.name ?? defaultTileset.src} style={imgStyle} alt='tileset-preview' />
        {canEdit &&
          <span style={shortcutsStyle}>1234567890</span>
        }
      </div>
      {canEdit &&
        <div style={deleteStyle}>-</div>
      }
      <div style={{ width: '120px' }}>
        <Select
          size='sm'
          value={selectedValue}
          placeholder={null}
          disabled={!canEdit}
          onChange={(e) => _handleSelectTileset(e)}
        >
          {options}
        </Select>
      </div>
      <FileSelectButton
        label='Upload Tileset'
        variant='outline'
        id='tileset-image'
        accept='image/*'
        disabled={!canEdit}
        onSelect={(fileObject) => _handleUploadTileset(fileObject)}
      />

      <Spacer />
    </HStack>
  )
}

export default TilesetSelector
