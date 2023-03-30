import React, { useState } from 'react'
import {
  HStack,
  Spacer,
  Text,
  Input,
  Box,
  VStack,
} from '@chakra-ui/react'
import { useRoomContext } from '@/hooks/RoomContext'
import { useDocument, useLocalDocument } from '@/hooks/useDocument'
import { useVeridaContext } from '@/hooks/VeridaContext'
import usePermission from '@/hooks/usePermission'
import Button from '@/components/Button'
import Textarea from '@/components/Textarea'
import { SliderPage } from '@/components/Sliders'
import { getFilenameFromUrl } from '@/core/utils'
import { TYPE } from '@/core/components/screen'

//----------------------
// Generic Screen Editor
//
const ScreenEditor = ({
  screenId,
  initialFocusRef,
  options = {},
}) => {
  const screen = useDocument('screen', screenId)
  const { canEdit } = usePermission(screenId)

  const _disabled = !screen || !canEdit

  if (screen?.type == TYPE.DOCUMENT) {
    return <ScreenEditorDocument screen={screen} screenId={screenId} initialFocusRef={initialFocusRef} options={options} disabled={_disabled} />
  }

  if (screen?.type == TYPE.PDF_BOOK) {
    return <ScreenEditorPdfBook screen={screen} screenId={screenId} initialFocusRef={initialFocusRef} options={options} disabled={_disabled} />
  }

  return (
    <div className='FillParent ScreenError'>
      Invalid screen type [{screen?.type}]
    </div>
  )
}

export default ScreenEditor


//---------------------------
// Specialized Screen Editors
//

const ScreenEditorDocument = ({
  screen,
  screenId,
  disabled = true,
  initialFocusRef,
  options = {},
}) => {
  const { Screen } = useRoomContext()
  const { veridaIsConnected, retrieveLastTweet } = useVeridaContext()

  const _onContentChange = (e) => {
    const content = e.target.value
    Screen.updateScreen(screenId, {
      content,
    })
  }

  const [isFetchingTweet, setIsFetchingTweet] = useState(false)
  const _lastTweet = async () => {
    setIsFetchingTweet(true)
    const content = await retrieveLastTweet()
    setIsFetchingTweet(false)
    console.warn(`USE THIS TWEET:`, content)
  }

  return (
    <div>
      <VStack align='stretch'>
        <Textarea
          ref={initialFocusRef}
          value={screen?.content ?? `Screen [${screenId}] not found`}
          onChange={(e) => _onContentChange(e)}
          disabled={disabled}
          minRows={options.minRows}
          maxRows={options.maxRows}
        />
        <HStack>
          <Button size='sm' onClick={async () => await _lastTweet()} disabled={!veridaIsConnected || isFetchingTweet}>
            Append Last Tweet
          </Button>
          <Spacer />
        </HStack>
      </VStack>
    </div>
  )
}


const ScreenEditorPdfBook = ({
  screen,
  screenId,
  disabled = true,
  initialFocusRef,
  options = {},
}) => {
  const { Screen } = useRoomContext()
  const pageCount = useLocalDocument('page-count', screenId) ?? 1

  const _onContentChange = (e) => {
    const url = e.target.value
    const name = getFilenameFromUrl(url) ?? undefined
    Screen.updateScreen(screenId, {
      content: url,
      name,
    })
  }

  const _onProgressChange = (value) => {
    Screen.updateScreen(screenId, {
      page: value,
    })
  }

  return (
    <VStack align='stretch'>
      <HStack>
        <Text>URL:</Text>
        <Input
          ref={initialFocusRef}
          value={screen?.content ?? `Screen [${screenId}] not found`}
          onChange={(e) => _onContentChange(e)}
          disabled={disabled}
        />
      </HStack>
      <SliderPage defaultValue={screen?.page} pageCount={pageCount} onChange={(value) => _onProgressChange(value)} disabled={disabled} />
    </VStack>
  )
}
