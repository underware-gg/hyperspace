import { useEffect, useState, useMemo } from 'react'
import { HStack } from '@chakra-ui/react'
import Button from '@/components/Button'
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
    overDocument, documentId,
    tileX, tileY,
  } = usePlayer(agentId)

  const editor = useDocument('editor', agentId)

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
          <Button size='sm' onClick={() => emitAction('createScreen')}>
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

      {overDocument &&
        <>
          Document [<b>{documentId}</b>]
          <Button size='sm' onClick={async () => await lastTweet()}>
            Last Tweet
          </Button>
          <Button size='sm' onClick={() => emitAction('interact')}>
            Edit Document
          </Button>
        </>
      }

    </HStack>
  )
}

export default InteractMenu
