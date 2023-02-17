import {
  HStack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import useRoom from '@/hooks/useRoom'
import usePlayer from '@/hooks/usePlayer'
import usePermission from '@/hooks/usePermission'
import { useDocument } from '@/hooks/useDocument'
import { emitAction } from '@/core/controller'
import { DialogConfirm, useConfirmDisclosure } from '@/components/DialogConfirm'
import ModalPortal from '@/components/ModalPortal'
import Button from '@/components/Button'

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
  const portal = useDocument('portal', portalId)
  const { permission, isOwner, canEdit, canView } = usePermission(screenId)

  const portalDisclosure = useDisclosure()

  const deletePortalDisclosure = useConfirmDisclosure({
    header: 'Delete Portal',
    message: <>Delete Portal to Room <span className='Important'>{portalName}</span>?</>,
    confirmLabel: 'Delete',
    onConfirm: () => emitAction('delete'),
  })

  const enterPortalDisclosure = useConfirmDisclosure({
    header: 'Enter Portal',
    message: <>Enter Portal to Room <span className='Important'>{portalName}</span>{portal?.tile && `@[${portal.tile.x},${portal.tile.y}]`} ?</>,
    confirmLabel: 'Enter',
    onConfirm: () => emitAction('interact'),
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
          <Button size='sm' onClick={() => portalDisclosure.onOpen()}>
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
          <Button size='sm' disabled={!canEdit} onClick={() => enterPortalDisclosure.openConfirmDialog()}>
            [E]nter
          </Button>
          <Button size='sm' disabled={!canEdit} onClick={() => portalDisclosure.onOpen()}>
            Edit [P]ortal
          </Button>
          <Button size='sm' disabled={!canEdit} onClick={() => deletePortalDisclosure.openConfirmDialog()}>
            [Del]ete
          </Button>
          <DialogConfirm confirmDisclosure={enterPortalDisclosure} />
          <DialogConfirm confirmDisclosure={deletePortalDisclosure} />
        </>
      }

      <ModalPortal portalId={portalId} disclosure={portalDisclosure} newPortal={canPlace && !overPortal} />

      {overScreen &&
        <>
          {screen?.type}:<Text color='important'>{screen?.name ?? screenId}</Text>
          {canEdit ?
            <>
              <Button size='sm' disabled={!screen || !canEdit} onClick={() => emitAction('interact')}>
                [E]dit
              </Button>
              <Button size='sm' disabled={!screen || !canEdit} onClick={() => deleteScreenDisclosure.openConfirmDialog()}>
                [Del]ete
              </Button>
              <DialogConfirm confirmDisclosure={deleteScreenDisclosure} />
            </>
            :
            <Button size='sm' disabled={!screen || !canView} onClick={() => emitAction('interact')}>
              [V]iew
            </Button>
          }
        </>
      }
    </HStack>
  )
}

export default InteractMenu
