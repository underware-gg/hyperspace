import * as THREE from 'three'
import { getLocalStore } from '@/core/singleton'

class Renderer3D {
  init(canvas) {
    this.camera = new THREE.PerspectiveCamera(
      70,
      canvas.width / canvas.height,
      0.01,
      30
    )
    
    this.cameraOrbit = new THREE.Object3D()

    this.camOffset = this.camera.position

    this.cameraOrbit.position.set(0, -10, 0)
    this.cameraOrbit.lookAt(0, 10, 0)

    this.cameraOrbit.add(this.camera)

    this.scene = new THREE.Scene()
    this.scene.add(this.cameraOrbit)

    this.light = new THREE.DirectionalLight(0xFFFFFF, 1)
    this.light.position.set(3, 5, 5)
    this.light.target.position.set(0, 0, 0)

    this.scene.add(this.light)
    this.scene.add(this.light.target)

    this.hLight = new THREE.HemisphereLight(0xB1E1FF, 0x888888, 1)
    this.scene.add(this.hLight)

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      canvas,
    })

    window.onresize = () => {
      this.camera.aspect = canvas.width / canvas.height
      this.camera.updateProjectionMatrix()
    }

    const localStore = getLocalStore()
    localStore.setDocument('scene', 'scene', this.scene)
    localStore.setDocument('camera', 'camera', this.camera)
    localStore.setDocument('cameraOrbit', 'cameraOrbit', this.cameraOrbit)
  }

  update(dt) {

  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }
}

export default Renderer3D
