import * as THREE from 'three'
import { getLocalStore } from '../singleton'

class Renderer3D {
  init(canvas) {
    this.camera = new THREE.PerspectiveCamera(
      70,
      canvas.width / canvas.height,
      0.01,
      20
    )
    
    this.cameraOrbit = new THREE.Object3D()

    this.camOffset = this.camera.position

    //this.camera.position.set(10, -480/32, 10)

    //this.camera.lookAt((640/32)/2, -(480/32)/2, 0)
    this.cameraOrbit.position.set(0, -10, 0)
    this.cameraOrbit.lookAt(0, 10, 0)

    //this.camera.position.set(0, -10, 0)
    //this.camera.lookAt(0, 10, 0)

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
      alpha: true,
      canvas,
    })

    window.onresize = () => {
      this.camera.aspect = canvas.width / canvas.height
      this.camera.updateProjectionMatrix()
    }

    // const sphereGeo = new THREE.SphereGeometry(.25)
    // const sphereMat = new THREE.MeshBasicMaterial({ color: 0xFF00FF })
    // this.sphereMesh = new THREE.Mesh(sphereGeo, sphereMat)
    // this.scene.add(this.sphereMesh)

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
