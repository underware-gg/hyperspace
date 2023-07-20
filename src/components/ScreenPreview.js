import React, { useEffect, useRef, useState } from 'react'
import { Box } from '@chakra-ui/react'
import { HTMLMesh } from '@/core/rendering/HTMLMesh'
import * as THREE from 'three'
import { useScreen } from '@/hooks/useScreen'

class PreviewRenderer {
  constructor() {
  }

  init(canvas, screenId) {
    if (!canvas) return
    // console.log(`INIT preview canvas`, canvas)

    const screenElement = document.getElementById(screenId)
    if (!screenElement) return

    // https://threejs.org/docs/?q=camera#api/en/cameras/OrthographicCamera
    this.camera = new THREE.OrthographicCamera(
      canvas.width * -0.5,
      canvas.width * 0.5,
      canvas.height * -0.5,
      canvas.height * 0.5,
      100, -100)

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xf0f0f0)

    const light = new THREE.AmbientLight(0xffffff, 1)
    this.scene.add(light)

    this.screenMesh = new HTMLMesh(screenElement, canvas.width, canvas.height, false)
    this.screenMesh.name = screenId
    this.screenMesh.position.set(0, 0, -10)
    this.screenMesh.rotation.x = Math.PI
    this.scene.add(this.screenMesh)

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      canvas,
    })

    this.needToUpdate = false

    // window.onresize = () => {
    //   this.camera.aspect = canvas.width / canvas.height
    //   this.camera.updateProjectionMatrix()
    // }
  }

  update() {
    this.needToUpdate = true
  }

  animate() {
    if (this.needToUpdate) {
      this.screenMesh.update()
      this.needToUpdate = false
    }
    requestAnimationFrame(this.animate.bind(this))
    this.render()
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }
}

const ScreenPreview = ({
  screenId,
}) => {
  const [renderer, setRenderer] = useState(null)
  const canvasRef = useRef()

  useEffect(() => {
    const _renderer = new PreviewRenderer()
    setRenderer(_renderer)
  }, [])

  useEffect(() => {
    if (renderer && canvasRef.current && screenId) {
      renderer.init(canvasRef.current, screenId)
      renderer.animate()
    }
  }, [renderer, canvasRef, screenId])

  const { screen } = useScreen(screenId)

  useEffect(() => {
    if (renderer && screen) {
      renderer.update()
    }
  }, [screen])

  return (
    <Box
      className='Relative'
      maxW='600'
    >
      <canvas
        id='screenPreview'
        ref={canvasRef}
        width={process.env.SCREEN_WIDTH}
        height={process.env.SCREEN_HEIGHT}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        Canvas not supported by your browser.
      </canvas>
    </Box>

  )
}

export default ScreenPreview
