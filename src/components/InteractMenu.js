import {
  HStack,
  Text,
} from '@chakra-ui/react'
import Button from '@/components/Button'
import useRoom from '@/hooks/useRoom'
import usePlayer from '@/hooks/usePlayer'
import usePermission from '@/hooks/usePermission'
import { useDocument } from '@/hooks/useDocument'
import { emitAction } from '@/core/controller'
import { DialogConfirm, useConfirmDisclosure } from '@/components/DialogConfirm'

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
  const { permission, isOwner, canEdit } = usePermission(screenId)

  const deletePortalDisclosure = useConfirmDisclosure({
    header: 'Delete Portal',
    message: <>Delete Portal to <span className='Important'>{portalName}</span>?</>,
    confirmLabel: 'Delete',
    onConfirm:() => emitAction('delete'),
  })

  const deleteScreenDisclosure = useConfirmDisclosure({
    header: 'Delete Screen',
    message: <>Delete Screen <span className='Important'>{screen?.name}</span>?</>,
    confirmLabel: 'Delete',
    onConfirm: () => emitAction('delete'),
  })

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
          <Button size='sm' disabled={!canEdit} onClick={() => emitAction('interact')}>
            [E]nter
          </Button>
          <Button size='sm' disabled={!canEdit} onClick={() => deletePortalDisclosure.openConfirmDialog()}>
            [Del]ete
          </Button>
          <DialogConfirm confirmDisclosure={deletePortalDisclosure} />
        </>
      }

      {overScreen &&
        <>
          {screen?.type}:<Text color='important'>{screen?.name ?? screenId}</Text>
          <Button size='sm' disabled={!screen || !canEdit} onClick={() => emitAction('interact')}>
            [E]dit
          </Button>
          <Button size='sm' disabled={!screen || !canEdit} onClick={() => deleteScreenDisclosure.openConfirmDialog()}>
            [Del]ete
          </Button>
          <DialogConfirm confirmDisclosure={deleteScreenDisclosure} />
        </>
      }
    </HStack>
  )
}

export default InteractMenu
