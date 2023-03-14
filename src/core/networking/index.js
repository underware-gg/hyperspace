import { serverUrl } from './config'

// Create a Room
export const create = (slug, store, agent = null) => {
  return new ClientRoom(serverUrl, slug, store, agent)
}


//-------------------------------
// DEPRECATION WARNING
//
// The singleton ClientRoom will be removed soon
// avoid using it!
//
import ClientRoom from './client-room'
import { getRemoteStore } from '@/core/singleton'

// Create the main Room singleton

let clientRoom = null

export const init = (slug) => {
  if (clientRoom !== null) {
    console.warn(`ClientRoom.init() can be called only once. Use ClientRoom.create() to open another document`)
    return
  }
  clientRoom = create(slug, getRemoteStore())
}

export const get = () => clientRoom
