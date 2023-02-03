import { useEffect, useState, useMemo, useRef } from 'react'
import { HStack } from '@chakra-ui/react'
import Button from '@/components/Button'
import DialogConfirm from '@/components/DialogConfirm'
import useRoom from '@/hooks/useRoom'
import usePlayer from '@/hooks/usePlayer'
import useDocument from '@/hooks/useDocument'
import { emitAction } from '@/core/controller'

const InteractMenu = ({
  customTileset,
  onSelect,
}) => {
  const { agentId } = useRoom();
  const {
    canPlace,
    overPortal, portalId, portalName,
    overScreen, screenId,
    overBook, bookId,
    tileX, tileY,
  } = usePlayer(agentId)

  const editor = useDocument('editor', agentId)

  const _createScreen = () => {
    emitAction('createScreen')
  }

  return (
    <HStack>
      {canPlace &&
        <>
          {editor?.interacting
            ? <>Edit@[{editor.position.x},{editor.position.y}]&nbsp;</>
            : <>Player@[{tileX},{tileY}]&nbsp;</>
          }
          <Button size='sm' onClick={() => emitAction('createPortal')}>
            [P]lace [P]ortal
          </Button>
          <Button size='sm' onClick={() => _createScreen()}>
            [N]ew scree[N]
          </Button>
          <Button size='sm' onClick={() => emitAction('createBook')}>
            New [B]ook
          </Button>
        </>
      }

      {overPortal &&
        <>
          Portal [<b>{portalName}</b>]
          <Button size='sm' onClick={() => emitAction('interact')}>
            [E]nter
          </Button>
          <Button size='sm' onClick={() => emitAction('delete')}>
            [Del]ete
          </Button>
        </>
      }

      {overScreen &&
        <>
          Screen [<b>{screenId}</b>]
          <Button size='sm' onClick={() => emitAction('interact')}>
            [E]dit
          </Button>
          <Button size='sm' onClick={() => emitAction('delete')}>
            [Del]ete
          </Button>
          <Button size='sm' onClick={async () => await lastTweet()}>
            Last Tweet
          </Button>
        </>
      }

      {overBook &&
        <>
          Book [<b>{bookId}</b>]
          <Button size='sm' onClick={() => emitAction('interact')}>
            r[E]ad
          </Button>
          <Button size='sm' onClick={() => emitAction('delete')}>
            [Del]ete
          </Button>
        </>
      }

      <DialogConfirm id='screenNameDialog' />
    </HStack>
  )
}

export default InteractMenu
