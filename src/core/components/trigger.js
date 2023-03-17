import * as THREE from 'three'
import RoomCollection from '@/core/interfaces/RoomCollection'
import { getTextureImageByName } from '@/core/textures'
import { floors } from '@/core/components/map'

class Trigger extends RoomCollection {
  constructor(room) {
    super(room, 'trigger')

    const scene = this.localStore.getDocument('scene', 'scene')

    if (scene == null) {
      return // no 3d render
    }

    const triggerGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.25, 32, 1, true)

    const _updateTriggerState = (triggerMesh, trigger) => {
      if (triggerMesh === null) return
      triggerMesh.material.color.set(trigger.state == 0 ? '#f00' : '#0f0')
    }

    this.remoteStore.on({ type: 'trigger', event: 'create' }, (triggerId, trigger) => {
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
      this.localStore.setDocument('trigger-mesh', triggerId, triggerMesh)

      this.Map.updateMeshPositionToMap(triggerMesh, trigger.position)

      _updateTriggerState(triggerMesh, trigger)
    })

    this.remoteStore.on({ type: 'trigger', event: 'change' }, (triggerId, trigger) => {
      const triggerMesh = this.localStore.getDocument('trigger-mesh', triggerId)
      _updateTriggerState(triggerMesh, trigger)
    })

    this.remoteStore.on({ type: 'trigger', event: 'delete' }, (triggerId) => {
      const triggerMesh = this.localStore.getDocument('trigger-mesh', triggerId)
      if (triggerMesh === null) return
      scene.remove(triggerMesh)
      this.localStore.setDocument('trigger-mesh', triggerId, null)
    })

    // If we had something that said "how the data has changed" it would help a lot.
    this.remoteStore.on({ type: 'map', event: 'update' }, (id, map) => {
      if (id !== 'world') {
        return
      }

      const triggerIds = this.remoteStore.getIds('trigger')

      for (const triggerId of triggerIds) {
        const trigger = this.remoteStore.getDocument('trigger', triggerId)
        if (trigger === null) continue

        const triggerMesh = this.localStore.getDocument('trigger-mesh', triggerId)

        this.Map.updateMeshPositionToMap(triggerMesh, trigger.position)
      }
    })
  }

  updateTrigger(id, values) {
    this.upsert(id, values, true)
  }

  tileNumberToIndex = (value) => {
    let tile = parseInt(value)
    if (tile == 0) tile = 10
    return tile - 1
  }

  switchState(id) {
    let trigger = this.remoteStore.getDocument('trigger', id)
    if (trigger == null) return

    if (!this.canView(id)) {
      console.warn(`No permission to switch Trigger [${id}]`)
      return
    }

    const state = (trigger.state + 1) % 2

    this.updateTrigger(id, {
      state,
    })

    const data = JSON.parse(trigger.data)
    // console.log(data)

    for (const i of data) {
      if (i.type == 'map') {
        console.log(`switch map:`, i)
        let tileNumber = state == 0 ? i.stateOff : i.stateOn
        let tileIndex = this.tileNumberToIndex(tileNumber)
        this.Map.updateTile('world', parseInt(i.x), parseInt(i.y), tileIndex)
      }
    }

  }

  render2d(id, context) {
    const trigger = this.remoteStore.getDocument('trigger', id)

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
}

export default Trigger
