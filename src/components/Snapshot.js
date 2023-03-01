import React, { useMemo } from 'react'
import {
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  HStack,
  Text,
  Box,
} from '@chakra-ui/react'
import { DownloadIcon } from '@chakra-ui/icons'
import { useDocumentIds } from '@/hooks/useDocumentIds'
import { useDocumentTypes } from '@/hooks/useDocumentTypes'

const Snapshot = ({
  store,
}) => {
  const types = useDocumentTypes(store)

  const items = useMemo(() => {
    let result = []
    for (const type of types) {
      result.push(
        <Type key={type} store={store} type={type} />
      )
    }
    return result
  }, [types])

  return (
    <Box overflowY='scroll' height='400px' maxH='400px'>
      <Accordion allowMultiple>
        {items}
      </Accordion>
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
}) => {
  const ids = useDocumentIds(type, store)

  const items = useMemo(() => {
    let result = []
    for (const id of ids) {
      const doc = store?.getDocument(type, id) ?? null
      if(!doc) continue
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

  return (
    <AccordionItem className='AccordionItem'>
      <AccordionButton style={{
        height: '1.5em'
      }}>
        <Box as="span" flex='1' textAlign='left'>
          {type} ({items.length})
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel style={{
        backgroundColor: '#fff2'
      }}>
        {items}
      </AccordionPanel>
    </AccordionItem>
  )
}

export default Snapshot
