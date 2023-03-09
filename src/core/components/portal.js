import { nanoid } from 'nanoid'
import * as THREE from 'three'
import RoomCollection from '@/core/interfaces/RoomCollection'
import { getTextureImageByName } from '@/core/textures'
import { floors } from '@/core/components/map'
import Cookies from 'universal-cookie';

class Portal extends RoomCollection {
  constructor(room) {
    super(room, 'portal')

    const scene = this.localStore.getDocument('scene', 'scene')

    if (scene === null) {
      console.warn(`Scene is null`)
      return
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

    const _updatePortalPosition = (portalMesh, portal) => {
      if (portalMesh === null) return

      const tile = this.Map.getTile('world', portal.position.x, portal.position.y)
      if (tile === null) return

      const currentFloorHeight = floors[tile]

      // maybe we should be updating the y position of the portal but
      // for now we will just update where the render happens.
      portalMesh.position.set(
        (Math.floor(portal.position.x)) + 0.5,
        (-Math.floor(portal.position.y)) - 0.5,
        currentFloorHeight + .5,
      )
    }

    this.remoteStore.on({ type: 'portal', event: 'create' }, (portalId, portal) => {
      const portalMesh = new THREE.Mesh(portalGeometry, portalMaterial)

      const map = this.remoteStore.getDocument('map', 'world')
      if (map === null) return

      portalMesh.position.set(
        (Math.floor(portal.position.x)) + 0.5,
        (-Math.floor(portal.position.y)) - 0.5,
        0,
      )
      portalMesh.rotation.set(Math.PI / 2, 0, 0);

      _updatePortalPosition(portalMesh, portal)

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
        _updatePortalPosition(portalMesh, portal)
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
    let portal = this.remoteStore.getDocument('portal', id)
    if (portal == null) return

    if (!this.Permission.canEdit(id)) {
      console.warn(`No permission to update Portal [${id}] to [${portal.slug}]`)
      return
    }

    this.remoteStore.setDocument('portal', id, {
      ...portal, ...values
    })
  }

  travel(id) {
    const portal = this.remoteStore.getDocument('portal', id)
    if (portal == null) return

    if (!this.Permission.canView(id)) {
      console.warn(`No permission to enter Portal [${id}]`)
      return
    }

    // Travel to the same room
    if (this.slug == portal.slug) {
      this.Player.moveToTile(this.agentId, portal.tile)
    } else {
      // Travel to other Room
      const data = {
        agentId: this.agentId,
        from: this.slug,
        slug: portal.slug,
        tile: portal.tile ?? null,
      }
      const cookies = new Cookies();
      cookies.set('portal', JSON.stringify(data), { path: '/' });
      window.location.href = `/${portal.slug}`
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
