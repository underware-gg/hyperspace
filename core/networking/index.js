import ClientRoom from './client-room'
import { serverUrl } from './config'

let clientRoom = null

export const init = (id) => {
  clientRoom = new ClientRoom(serverUrl, id)
}

export const get = () => clientRoom
