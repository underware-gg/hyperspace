import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  HStack, VStack, Spacer,
  Text,
  Box,
  Checkbox,
} from '@chakra-ui/react'
import {
  DownloadIcon,
  DeleteIcon,
} from '@chakra-ui/icons'
import { useDocumentIds } from '@/hooks/useDocumentIds'
import { useDocumentTypes } from '@/hooks/useDocumentTypes'
import { MapPreview } from '@/components/Map2D'

const Snapshot = ({
  store,
  height = '400px',
  expanded = false,
  excludeTypes = [],
  onTypesSelected = null, // (types) => {}
}) => {
  const types = useDocumentTypes(store, excludeTypes)

  const [selectedTypes, setSelectedTypes] = useState([])
  const selectedTypesRef = useRef()
  useEffect(() => {
    if (onTypesSelected && types.length > selectedTypes.length) {
      setSelectedTypes([...types])
    }
  }, [types])

  useEffect(() => {
    selectedTypesRef.current = selectedTypes
    onTypesSelected?.(selectedTypes)
  }, [selectedTypes])


  const _onSelectType = (type, selected) => {
    let _types = [...selectedTypesRef.current]
    const index = _types.indexOf(type);
    if (selected && index == -1) {
      _types.push(type)
    } else if (!selected && index != -1) {
      _types.splice(index, 1)
    }
    setSelectedTypes(_types)
  }

  const items = useMemo(() => {
    let result = []
    for (const type of types) {
      result.push(
        <Type key={type}
          store={store}
          type={type}
          selected={onTypesSelected ? true : null}
          onSelect={_onSelectType}
        />
      )
    }
    return result
  }, [types])

  return (
    <Box overflowY='scroll' height={height} maxH={height}>
      {items.length > 0 &&
        <Accordion allowMultiple defaultIndex={expanded ? Array.from(Array(types.length).keys()) : []} >
          {items}
        </Accordion>
      }
    </Box>
  )
}

let _logged = false

const Type = ({
  store,
  type,
  selected = null,
  onSelect = (type, selected) => { },
}) => {
  const ids = useDocumentIds(type, store) ?? []

  const _log = (type, id, content) => {
    console.log(`${type} [${id}]:`, content)
    if (!_logged) {
      alert(`Document dumped to the console`)
      _logged = true
    }
  }

  const _delete = (type, id) => {
    store.setDocument(type, id, null)
    console.log(`deleted ${type} [${id}]`)
  }

  const items = useMemo(() => {
    let result = []
    for (let i = 0; i < ids.length; ++i) {
      const id = ids[i]
      const doc = store?.getDocument(type, id) ?? null
      if (!doc) continue
      const name = doc.name ?? doc.slug ?? doc?.id ?? null
      const content = doc.content ? doc.content.slice(0, 20) : null
      result.push(
        <VStack key={id} alignItems='left' className={`SlugItem${i%2}`}>
          <HStack>
            <DownloadIcon boxSize='0.8em' className='Clickable MarginSide' onClick={() => _log(type, id, doc)} />
            <Text>
              {id}
              {name && ` (${name})`}
              {content && ` : ${content}...`}
            </Text>
            <Spacer />
            {process.env.DEV &&
              <DeleteIcon boxSize='0.8em' className='Clickable MarginSide' onClick={() => _delete(type, id)} />
            }
          </HStack>
          {type == 'map2' && <MapPreview store={store} />}
        </VStack>
      )
    }
    return result
  }, [ids])

  if (ids.length == 0) {
    return null
  }

  return (
    <AccordionItem className='AccordionItem'>
      <AccordionButton style={{
        height: '1.5em'
      }}>
        {selected !== null && <>
          <Checkbox colorScheme='teal' defaultChecked={selected} onChange={(element) => onSelect(type, element.target.checked)} />
          <span>&nbsp;</span>
        </>
        }
        <Box as="span" flex='1' textAlign='left'>
          {type} ({items.length})
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel style={{
        padding: '0.25em 0.5em',
      }}>
        {items}
      </AccordionPanel>
    </AccordionItem>
  )
}

export default Snapshot
