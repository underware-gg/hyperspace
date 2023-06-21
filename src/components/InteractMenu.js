import {
  HStack,
  Spacer,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { useRoomContext } from '@/hooks/RoomContext'
import { useSessionDocument } from '@/hooks/useDocument'
import usePlayer from '@/hooks/usePlayer'
import usePermission from '@/hooks/usePermission'
import useActionDownListener from '@/hooks/useActionDownListener'
import { DialogConfirm, useConfirmDisclosure } from '@/components/DialogConfirm'
import ModalPortal from '@/components/ModalPortal'
import ModalTrigger from '@/components/ModalTrigger'
import ModalScreen from '@/components/ModalScreen'
import { Button } from '@/components/Button'

const InteractMenu = ({
  customTileset,
  onSelect,
}) => {
  const { agentId, actions } = useRoomContext()
  const {
    canPlace,
    overPortal, portalId, portalName, portal,
    overTrigger, triggerId, triggerName, trigger,
    overScreen, screenId, screen,
    tileX, tileY,
  } = usePlayer(agentId)

  const editor = useSessionDocument('editor', agentId)
  const { canEdit: canEditRoom, canView: canViewRoom } = usePermission('world')
  const { canEdit: canEditPortal, canView: canViewPortal } = usePermission(portalId)
  const { canEdit: canEditTrigger, canView: canViewTrigger } = usePermission(triggerId)
  const { canEdit: canEditScreen, canView: canViewScreen } = usePermission(screenId)

  const portalDisclosure = useDisclosure()
  const triggerDisclosure = useDisclosure()
  const screenDisclosure = useDisclosure()

  useActionDownListener('editPortal', () => {
    portalDisclosure.onOpen()
  })

  useActionDownListener('editTrigger', () => {
    triggerDisclosure.onOpen()
  })

  useActionDownListener('createScreen', () => {
    screenDisclosure.onOpen()
  })


  const deletePortalDisclosure = useConfirmDisclosure({
    header: 'Delete Portal',
    message: <>Delete Portal to Room <span className='Important'>{portalName}</span>?</>,
    confirmLabel: 'Delete',
    onConfirm: () => actions.emitAction('delete'),
  })

  const deleteTriggerDisclosure = useConfirmDisclosure({
    header: 'Delete Trigger',
    message: <>Delete Trigger <span className='Important'>{triggerName}</span>?</>,
    confirmLabel: 'Delete',
    onConfirm: () => actions.emitAction('delete'),
  })

  const enterPortalDisclosure = useConfirmDisclosure({
    header: 'Enter Portal',
    message: <>Enter Portal to Room <span className='Important'>{portalName}</span>{portal?.tile && `@[${portal.tile.x},${portal.tile.y}]`} ?</>,
    confirmLabel: 'Enter',
    onConfirm: () => actions.emitAction('interact'),
  })

  const deleteScreenDisclosure = useConfirmDisclosure({
    header: 'Delete Screen',
    message: <>Delete Screen <span className='Important'>{screen?.name}</span>?</>,
    confirmLabel: 'Delete',
    onConfirm: () => actions.emitAction('delete'),
  })

  return (
    <HStack>
      <Text w='130px' alignItems='right'>
        {editor?.interacting
          ? <>Cursor@[{editor.position.x},{editor.position.y}]&nbsp;</>
          : <>Player@[{tileX},{tileY}]&nbsp;</>
        }
      </Text>

      {canPlace &&
        <>
          <Button size='sm' disabled={!canEditRoom} onClick={() => actions.emitAction('editPortal')}>
            New [P]ortal
          </Button>
          <Button size='sm' disabled={!canEditRoom} onClick={() => screenDisclosure.onOpen()}>
            New scree[N]
          </Button>
          <Button size='sm' disabled={!canEditRoom} onClick={() => actions.emitAction('createBook')}>
            New [B]ook
          </Button>
          <Button size='sm' disabled={!canEditRoom} onClick={() => actions.emitAction('createTrigger')}>
            New Trigger
          </Button>
        </>
      }

      {overPortal &&
        <>
          Portal to&nbsp;<Text color='important'>{portalName}</Text>
          <Button size='sm' disabled={!canEditPortal} onClick={() => enterPortalDisclosure.openConfirmDialog()}>
            [E]nter
          </Button>
          <Button size='sm' disabled={!canEditPortal} onClick={() => portalDisclosure.onOpen()}>
            Edit [P]ortal
          </Button>
          <Button size='sm' disabled={!canEditPortal} onClick={() => deletePortalDisclosure.openConfirmDialog()}>
            [Del]ete
          </Button>
          <DialogConfirm confirmDisclosure={enterPortalDisclosure} />
          <DialogConfirm confirmDisclosure={deletePortalDisclosure} />
        </>
      }

      <ModalPortal portalId={portalId} disclosure={portalDisclosure} newPortal={canPlace && !overPortal} />

      {overTrigger &&
        <>
          Trigger&nbsp;<Text color='important'>{triggerName}</Text>
          <Button size='sm' disabled={!canEditTrigger} onClick={() => actions.emitAction('interact')}>
            [E]xecute
          </Button>
          <Button size='sm' disabled={!canEditTrigger} onClick={() => triggerDisclosure.onOpen()}>
            Edit Trigger
          </Button>
          <Button size='sm' disabled={!canEditTrigger} onClick={() => deleteTriggerDisclosure.openConfirmDialog()}>
            [Del]ete
          </Button>
          <DialogConfirm confirmDisclosure={deleteTriggerDisclosure} />
        </>
      }

      <ModalTrigger triggerId={triggerId} disclosure={triggerDisclosure} />

      {overScreen &&
        <>
          {screen?.type}:<Text color='important'>{screen?.name ?? screenId}</Text>
          {canEditScreen ?
            <>
              <Button size='sm' disabled={!screen || !canEditScreen} onClick={() => actions.emitAction('interact')}>
                [E]dit
              </Button>
              <Button size='sm' disabled={!screen || !canEditScreen} onClick={() => deleteScreenDisclosure.openConfirmDialog()}>
                [Del]ete
              </Button>
              <DialogConfirm confirmDisclosure={deleteScreenDisclosure} />
            </>
            :
            <Button size='sm' disabled={!screen || !canViewScreen} onClick={() => actions.emitAction('interact')}>
              [V]iew
            </Button>
          }
        </>
      }

      <ModalScreen screenId={screenId} disclosure={screenDisclosure} />

    </HStack>
  )
}

export default InteractMenu
