import * as THREE from 'three'
import * as Interactable from '@/core/components/interactable'
import * as Permission from '@/core/components/permission'
import * as Map from '@/core/components/map'
import { getTextureImageByName } from '@/core/textures'
import { getLocalStore, getRemoteStore } from '@/core/singleton'
import { getTile, floors } from '@/core/components/map'

export const init = () => {
  const remoteStore = getRemoteStore()
  const localStore = getLocalStore()
  const scene = localStore.getDocument('scene', 'scene')

  if (scene === null) {
    return
  }

  const triggerGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32, 1, true)

  const _updateTriggerState = (triggerMesh, trigger) => {
    if (triggerMesh === null) return
    triggerMesh.material.color.set(trigger.state == 0 ? '#f00' : '#0f0')
  }

  const _updateTriggerPosition = (triggerMesh, trigger) => {
    if (triggerMesh === null) return

    const tile = getTile('world', trigger.position.x, trigger.position.y)
    if (tile === null) return

    const currentFloorHeight = floors[tile]

    // maybe we should be updating the y position of the trigger but
    // for now we will just update where the render happens.
    triggerMesh.position.set(
      (Math.floor(trigger.position.x)) + 0.5,
      (-Math.floor(trigger.position.y)) - 0.5,
      currentFloorHeight + .5,
    )
  }

  remoteStore.on({ type: 'trigger', event: 'create' }, (triggerId, trigger) => {
    const triggerMaterial = new THREE.MeshLambertMaterial({
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      color: '#f00',
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    })

    const triggerMesh = new THREE.Mesh(triggerGeometry, triggerMaterial)

    triggerMesh.rotation.set(Math.PI / 2, 0, 0);

    scene.add(triggerMesh)
    localStore.setDocument('trigger-mesh', triggerId, triggerMesh)

    _updateTriggerPosition(triggerMesh, trigger)

    _updateTriggerState(triggerMesh, trigger)
  })

  remoteStore.on({ type: 'trigger', event: 'change' }, (triggerId, trigger) => {
    const triggerMesh = localStore.getDocument('trigger-mesh', triggerId)
    _updateTriggerState(triggerMesh, trigger)
  })

  remoteStore.on({ type: 'trigger', event: 'delete' }, (triggerId) => {
    const triggerMesh = localStore.getDocument('trigger-mesh', triggerId)
    if (triggerMesh === null) return
    scene.remove(triggerMesh)
    localStore.setDocument('trigger-mesh', triggerId, null)
  })

  // If we had something that said "how the data has changed" it would help a lot.
  remoteStore.on({ type: 'map', event: 'update' }, (id, map) => {
    if (id !== 'world') {
      return
    }

    const triggerIds = remoteStore.getIds('trigger')

    for (const triggerId of triggerIds) {
      const trigger = remoteStore.getDocument('trigger', triggerId)
      if (trigger === null) continue

      const triggerMesh = localStore.getDocument('trigger-mesh', triggerId)

      _updateTriggerPosition(triggerMesh, trigger)
    }
  })
}

export const create = (id, x, y, trigger) => {
  Interactable.create('trigger', id, x, y, trigger)
  return trigger
}

export const updateTrigger = (id, values) => {
  const store = getRemoteStore()
  let trigger = store.getDocument('trigger', id)
  if (trigger == null) return

  if (!Permission.canEdit(id)) {
    console.warn(`No permission to update Trigger [${id}] to [${trigger.slug}]`)
    return
  }

  store.setDocument('trigger', id, {
    ...trigger, ...values
  })
}

export const exists = (id) => {
  return Interactable.exists('trigger', id)
}

export const remove = (id) => {
  if (!Permission.canEdit(id)) {
    console.warn(`No permission to delete Trigger [${id}]`)
    return
  }
  return Interactable.remove('trigger', id)
}

export const switchState = (id) => {
  const store = getRemoteStore()
  let trigger = store.getDocument('trigger', id)
  if (trigger == null) return

  if (!Permission.canView(id)) {
    console.warn(`No permission to switch Trigger [${id}]`)
    return
  }

  const state = (trigger.state + 1) % 2

  updateTrigger(id, {
    state,
  })

  const data = JSON.parse(trigger.data)
  // console.log(data)

  for(const i of data) {
    if(i.type == 'map') {
      console.log(`switch map:`, i)
      const tile = state == 0 ? i.stateOff : i.stateOn
      Map.update('world', parseInt(i.x), parseInt(i.y), tile - 1)
    }
  }

}

export const getCollisionRect = (id) => {
  return Interactable.getCollisionRect('trigger', id)
}

export const render2d = (id, context) => {
  const store = getRemoteStore()
  const trigger = store.getDocument('trigger', id)

  if (trigger === null) {
    return
  }

  const { position: { x, y }, state, data } = trigger

  const texture = getTextureImageByName(`trigger_${state}`)

  context.drawImage(
    texture,
    Math.round(x * 32),
    Math.round(y * 32),
    32,
    32,
  )
}
