import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { getQuickJS, shouldInterruptAfterDeadline } from 'quickjs-emscripten'
import { VStack, Heading, Box, Text, Button } from '@chakra-ui/react'
import { nanoid } from 'nanoid'
import Layout from 'components/layout'
import DocumentModal from 'components/document-modal'
import useDocument from 'hooks/use-document'
import useLocalDocument from 'hooks/use-local-document'
import { getLocalStore, getRemoteStore } from 'core/singleton'
import { fromSourceToDataURL } from 'core/textures'
import * as Tileset from 'core/components/tileset'
import * as ClientRoom from 'core/networking'
import Textarea from 'components/textarea'
import CodeEditor from 'components/code-editor'

const isValidKey = (key) => {
  // Check if key is a string
  if (typeof key !== 'string') {
    return false
  }

  // Check if key is a reserved property of Object.prototype
  if (Object.prototype.hasOwnProperty(key)) {
    return false
  }

  // Check if key starts with "__" or "$$"
  if (key.startsWith('__') || key.startsWith('$$')) {
    return false
  }

  // Check if key contains any invalid characters
  if (!/^[a-zA-Z0-9_$]+$/.test(key)) {
    return false
  }

  // Key is valid
  return true
}

const handleTilesetChange = async (e) => {
  const files = e.target.files
  if (files && files[0]) {
    try {
      const { dataUrl, width, height } = await fromSourceToDataURL(URL.createObjectURL(files[0]))

      if (width === 320 && height === 32) {
        Tileset.create('world', { blob: dataUrl, size: { width, height } })
      } else {
        Tileset.remove('world')
      }
    } catch (e) {
      Tileset.remove('world')
    }
  }
}

const downloadRoomData = (slug) => {
  const room = ClientRoom.get()
  if (room === null) {
    return
  }

  const snapshotOps = room.getSnapshotOps()

  const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(snapshotOps))}`
  const dlAnchor = document.getElementById('download-room-data')
  dlAnchor.setAttribute('href', dataStr)
  dlAnchor.setAttribute('download', `room-${slug}.json`)
  dlAnchor.click()
}

const Room = () => {
  const [QuickJS, setQuickJS] = useState(null)
  const [code, setCode] = useState('')
  const document = useDocument('document', 'world')
  const tileset = useDocument('tileset', 'world')
  const is3d = useLocalDocument('show-3d', 'world') ?? false
  const isDocOpen = useLocalDocument('show-doc', 'world') ?? false
  const initialRef = useRef()
  const router = useRouter()
  const canvasRef = useRef()
  const canvas3dRef = useRef()
  const { slug } = router.query

  const setState = (type, key, value) => {
    if (!isValidKey(type)) {
      throw new Error(`Invalid type: ${type}`)
    }

    if (!isValidKey(key)) {
      throw new Error(`Invalid key: ${key}`)
    }

    const store = getRemoteStore()
    store.setDocument(type, key, value)
  }

  const setStateAtPath = (type, key, path, value) => {
    if (!isValidKey(type)) {
      throw new Error(`Invalid type: ${type}`)
    }

    if (!isValidKey(key)) {
      throw new Error(`Invalid key: ${key}`)
    }

    // Map.update('world', Math.floor(x/32), Math.floor(y/32), 4)
    const store = getRemoteStore()
    store.setValueAtPath(type, key, path, value)
  }

  const getState = (type, key) => {
    const store = getRemoteStore()
    return store.getDocument(type, key)
  }

  const handleChange = (e) => {
    setCode(e)
    // setCode(e.target.value)
  }

  useEffect(() => {
    getQuickJS().then((QuickJS) => {
      setQuickJS(QuickJS)
    })
  }, [])

  useEffect(() => {
    if (is3d) {
      if (canvasRef.current) {
        canvas3dRef.current.focus()
      }
    } else {
      if (canvas3dRef.current) {
        canvasRef.current.focus()
      }
    }
  }, [is3d, canvasRef, canvas3dRef])

  const handleInputChange = e => {
    const store = getRemoteStore()
    store.setDocument('document', 'world', { content: e.target.value })
  }

  const handleClose = () => {
    const store = getLocalStore()
    store.setDocument('show-doc', 'world', false)
  }

  const handleUploadRoomData = async (e) => {
    const files = e.target.files

    if (files?.[0] === undefined) {
      return
    }

    const file = files[0]

	  const reader = new FileReader()
	  reader.onload = (e2) => {
      const str = e2.target.result
	    const json = JSON.parse(str)

      const remoteStore = getRemoteStore()

      for (const op of json) {
        if (op.pathIndex === 0) {
          const { type, key, value } = op
          remoteStore.setDocument(type, key, value)
        }
      }
    }

	  reader.readAsText(file)
  }

  const handleExecute = (e) => {
    if (!QuickJS) return
    try {
      const vm = QuickJS.newContext()

      const setHandle = vm.newFunction('set', (...args) => {
        const nativeArgs = args.map(vm.dump)
        setState(...nativeArgs)
      })

      const setAtPathHandle = vm.newFunction('setAtPath', (...args) => {
        const nativeArgs = args.map(vm.dump)
        setStateAtPath(...nativeArgs)
      })

      const getHandle = vm.newFunction('get', (...args) => {
        const nativeArgs = args.map(vm.dump)
        const type = nativeArgs[0]
        if (!isValidKey(type)) {
          throw new Error(`Invalid type: ${type}`)
        }
        const key = nativeArgs[1]
        if (!isValidKEy(key)) {
          throw new Error(`Invalid key: ${key}`)
        }

        return vm.newObject(getState(type, key))
      })

      const stateHandle = vm.newObject()
      vm.setProp(stateHandle, 'set', setHandle)
      vm.setProp(stateHandle, 'setAtPath', setAtPathHandle)
      vm.setProp(stateHandle, 'get', getHandle)
      vm.setProp(vm.global, 'state', stateHandle)
      stateHandle.dispose()
      setHandle.dispose()
      setAtPathHandle.dispose()
      getHandle.dispose()

      const createIdHandle = vm.newFunction('create', () => {
        return vm.newObject(nanoid())
      })
      const idHandle = vm.newObject()
      vm.setProp(idHandle, 'create', createIdHandle)
      vm.setProp(vm.global, 'id', idHandle)
      idHandle.dispose()
      createIdHandle.dispose()

      const result = vm.evalCode(code, {
        shouldInterrupt: shouldInterruptAfterDeadline(Date.now() + 1000),
        memoryLimitBytes: 1024 * 1024,
      })

      if (result.error) {
        console.log('Execution failed:', vm.dump(result.error))
        result.error.dispose()
      } else {
        console.log('Success:', vm.dump(result.value))
        result.value.dispose()
      }
      vm.dispose()
    } catch (e) {
      console.log('_ERROR_', e)
    }
  }

  useEffect(() => {
    if (canvasRef.current && canvas3dRef.current && slug) {
      import ('core/game').then(({ default: Game }) => {
        const game = new Game()
        game.init(slug, canvasRef.current, canvas3dRef.current)
      })
    }
  }, [slug, canvasRef, canvas3dRef])

  return (
    <Layout>
      <VStack align='stretch' w='100%' spacing={4} shouldWrapChildren>
        <Heading as='h1' size='2xl'>
          Metaverse in a box
        </Heading>
        <Text>
          A metaverse project using CRDTs for state synchronisation.
        </Text>
        <label htmlFor="tileset-image">Select tileset:</label>
        <input type="file" id="tileset-image" name="img" accept="image/*" onChange={handleTilesetChange} />
        <img src={tileset?.blob ?? 'tileset.png'} alt="tileset-preview" />
        {/* <Textarea
          value={code}
          onChange={handleChange}
        /> */}
        <CodeEditor
          value={code}
          onChange={handleChange}
        />
        <Button colorScheme='teal' size='md' onClick={handleExecute}>
          Execute
        </Button>
        <Box
          border="1px"
          borderRadius="4px"
        >
          <DocumentModal
            initialRef={initialRef}
            finalRef={is3d ? canvas3dRef : canvasRef}
            text={document?.content || ''}
            isOpen={isDocOpen}
            onClose={handleClose}
            onInputChange={handleInputChange}
          />
          <canvas
            id="game"
            ref={canvasRef}
            border="1px"
            borderradius={4}
            width={640}
            height={480}
            style={{
              width: '100%',
              height: '100%',
              borderTop: '1px solid white',
              borderBottom: '1px solid white',
              display: is3d ? 'none' : 'block',
            }}
            tabIndex="1"
          >
            Canvas not supported by your browser.
          </canvas>
          <canvas
            id="game3D"
            ref={canvas3dRef}
            border="1px"
            borderradius={4}
            width={640}
            height={480}
            style={{
              width: '100%',
              height: '100%',
              display: is3d ? 'block' : 'none',
            }}
            tabIndex="2"
          >
            Canvas not supported by your browser.
          </canvas>
        </Box>
        <label htmlFor="upload-room-data">Upload room data</label>
        <input type="file" id="upload-room-data" accept=".json" onChange={handleUploadRoomData} />
        <a id="download-room-data" href="#" style={{ display: 'none' }}></a>
        <Button colorScheme='teal' size='md' onClick={() => { downloadRoomData(slug) }}>
          Download room data
        </Button>
      </VStack>
    </Layout>
  )
}

export default Room
