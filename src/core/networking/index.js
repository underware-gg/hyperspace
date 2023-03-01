import ClientRoom from './client-room'
import { serverUrl } from './config'

let clientRoom = null

// Create a Room
export const create = (slug, store = null, agent = null) => {
  return new ClientRoom(serverUrl, slug, store, agent)
}

// Create the main Room singleton
export const init = (slug) => {
  if (clientRoom !== null) {
    console.warn(`ClientRoom.init() can be called only once. Use ClientRoom.create() to open another document`)
    return
  }
  clientRoom = create(slug)
}

export const get = () => clientRoom
