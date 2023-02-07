import {
  HStack,
  Text,
} from '@chakra-ui/react'
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
    tileX, tileY,
  } = usePlayer(agentId)

  const editor = useDocument('editor', agentId)
  const screen = useDocument('screen', screenId)

  return (
    <HStack>
      {canPlace &&
        <>
          {editor?.interacting
            ? <>Edit@[{editor.position.x},{editor.position.y}]&nbsp;</>
            : <>Player@[{tileX},{tileY}]&nbsp;</>
          }
          <Button size='sm' onClick={() => emitAction('createPortal')}>
            New [P]ortal
          </Button>
          <Button size='sm' onClick={() => emitAction('createScreen')}>
            New scree[N]
          </Button>
          <Button size='sm' onClick={() => emitAction('createBook')}>
            New [B]ook
          </Button>
        </>
      }

      {overPortal &&
        <>
          Portal to&nbsp;<Text color='important'>{portalName}</Text>
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
          {screen?.type}&nbsp;<Text color='important'>{screen?.name ?? screenId}</Text>:
          <Button size='sm' onClick={() => emitAction('interact')} disabled={!screen}>
            [E]dit
          </Button>
          <Button size='sm' onClick={() => emitAction('delete')} disabled={!screen}>
            [Del]ete
          </Button>
          <Button size='sm' onClick={async () => await lastTweet()} disabled={!screen}>
            Last Tweet
          </Button>
        </>
      }
    </HStack>
  )
}

export default InteractMenu
