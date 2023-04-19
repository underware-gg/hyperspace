import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  HStack,
  Text,
  Box,
  Checkbox,
} from '@chakra-ui/react'
import { DownloadIcon } from '@chakra-ui/icons'
import { useDocumentIds } from '@/hooks/useDocumentIds'
import { useDocumentTypes } from '@/hooks/useDocumentTypes'

const Snapshot = ({
  store,
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
    <Box overflowY='scroll' height='400px' maxH='400px'>
      {items.length > 0 &&
        <Accordion allowMultiple defaultIndex={expanded ? Array.from(Array(types.length).keys()) : []} >
          {items}
        </Accordion>
      }
    </Box>
  )
}

let _logged = false
const _log = (type, id, content) => {
  console.log(type, id, content)
  if (!_logged) {
    alert(`Document dumped to the console`)
    _logged = true
  }
}

const Type = ({
  store,
  type,
  selected = null,
  onSelect = (type, selected) => { },
}) => {
  const ids = useDocumentIds(type, store) ?? []

  const items = useMemo(() => {
    let result = []
    for (const id of ids) {
      const doc = store?.getDocument(type, id) ?? null
      if (!doc) continue
      const name = doc.name ?? doc.slug ?? doc?.id ?? null
      const content = doc.content ? doc.content.slice(0, 20) : null
      result.push(
        <HStack key={id}>
          <DownloadIcon boxSize='0.8em' className='Clickable' onClick={() => _log(type, id, doc)} />
          <Text>
            {id}
            {name && ` (${name})`}
            {content && ` : ${content}...`}
          </Text>
        </HStack>
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
        backgroundColor: '#222c',
        padding: '0.25em 0.5em',
      }}>
        {items}
      </AccordionPanel>
    </AccordionItem>
  )
}

export default Snapshot
