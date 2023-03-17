import { nanoid } from 'nanoid'
import * as THREE from 'three'
import RoomCollection from '@/core/interfaces/RoomCollection'
import { getTextureImageByName } from '@/core/textures'
import Cookies from 'universal-cookie'

class Portal extends RoomCollection {
  constructor(room) {
    super(room, 'portal')

    const scene = this.localStore.getDocument('scene', 'scene')

    if (scene == null) {
      return // no 3d render
    }

    const portalGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2.5, 32, 1, true)

    const portalMaterial = new THREE.MeshLambertMaterial({
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      color: '#fff',
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    })

    this.remoteStore.on({ type: 'portal', event: 'create' }, (portalId, portal) => {
      const portalMesh = new THREE.Mesh(portalGeometry, portalMaterial)

      const map = this.remoteStore.getDocument('map', 'world')
      if (map === null) return

      portalMesh.rotation.set(Math.PI / 2, 0, 0);

      this.Map.updateMeshPositionToMap(portalMesh, portal.position)

      scene.add(portalMesh)
      this.localStore.setDocument('portal-mesh', portalId, portalMesh)
    })

    this.remoteStore.on({ type: 'portal', event: 'delete' }, (portalId) => {
      const portalMesh = this.localStore.getDocument('portal-mesh', portalId)
      if (portalMesh === null) return

      scene.remove(portalMesh)
      this.localStore.setDocument('portal-mesh', portalId, null)
    })

    // If we had something that said "how the data has changed" it would help a lot.
    this.remoteStore.on({ type: 'map', event: 'update' }, (id, map) => {
      if (id !== 'world') return

      const portalIds = this.remoteStore.getIds('portal')

      for (const portalId of portalIds) {
        const portal = this.remoteStore.getDocument('portal', portalId)
        if (portal === null) continue

        const portalMesh = this.localStore.getDocument('portal-mesh', portalId)

        this.Map.updateMeshPositionToMap(portalMesh, portal.position)
      }
    })
  }

  createPortal(slug, tile, x, y) {
    const portal = {
      slug,
      tile,
    }
    this.createAtPosition(nanoid(), portal, x, y)
    return portal
  }

  updatePortal(id, values) {
    if (!this.exists(id)) return
    this.upsert(id, values, true)
  }

  travel(id) {
    const portal = this.remoteStore.getDocument('portal', id)
    if (portal == null) return

    if (!this.canView(id)) {
      console.warn(`No permission to enter Portal [${id}]`)
      return
    }

    // Travel to the same room
    if (this.slug == portal.slug) {
      this.Player.moveToTile(this.agentId, portal.tile)
    } else {
      const cookies = new Cookies()
      const portalCookie = {
        agentId: this.agentId,
        from: this.slug,
        to: portal.slug,
        exit: portal.position ?? null,
        entry: portal.tile ?? null,
      }
      cookies.set('portal', JSON.stringify(portalCookie), { path: '/' })
      // Travel to portal destination
      this.clientRoom.emit('travel', portal.slug)
    }
  }

  render2d(id, context) {
    const portal = this.remoteStore.getDocument('portal', id)
    if (portal === null) return

    const { position: { x, y } } = portal

    const texture = getTextureImageByName('portal')

    let t = 0
    if (this.Player.getPortalOverPlayer(this.agentId) == id) {
      t = new Date().getTime() / 10000;
    }

    context.save()
    context.translate(Math.round(x * 32 + 16), Math.round(y * 32 + 16));
    context.rotate((t % 1) * Math.PI * 2);
    context.translate(-16, -16);
    context.drawImage(
      texture,
      0,
      0,
      32,
      32,
    )
    context.restore();
  }
}

export default Portal
