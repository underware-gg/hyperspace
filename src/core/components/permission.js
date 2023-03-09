import RoomCollection from '@/core/interfaces/RoomCollection'
import * as Interactable from '@/core/components/interactable'

class Permission extends RoomCollection {
  constructor(room) {
    super(room, 'permission')
  }

  exists(id) {
    return Interactable.exists('permission', id)
  }

  remove(id) {
    return Interactable.remove('permission', id)
  }

  canView(id, didAddress) {
    const permission = this.remoteStore.getDocument('permission', id)
    if (!permission) {
      return true
    }
    if (didAddress === undefined) {
      didAddress = this.localStore.getDocument('user', 'VeridaUser')?.getDidAddress() ?? null
    }
    return (permission.visible || permission.owner == didAddress)
  }

  canEdit(id, didAddress) {
    const permission = this.remoteStore.getDocument('permission', id)
    if (!permission) {
      return true
    }
    if (didAddress === undefined) {
      didAddress = this.localStore.getDocument('user', 'VeridaUser')?.getDidAddress() ?? null
    }
    return ((permission.visible && permission.public) || permission.owner == didAddress)
  }

  updatePermission(id, owner, values) {
    let permission = this.remoteStore.getDocument('permission', id)

    if (!permission) {
      permission = {
        id,
        owner,
        visible: true,
        public: true,
      }
    } else if (permission.owner != owner) {
      console.warn(`Not owner!`, id)
      return
    }

    permission = {
      ...permission,
      ...values,
    }

    this.remoteStore.setDocument('permission', id, permission)
  }

}

export default Permission
