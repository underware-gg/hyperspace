import ClientRoom from './client-room'
import { serverUrl } from './config'

// Create a Room
export const create = (slug, store, agent = null) => {
  return new ClientRoom(serverUrl, slug, store, agent)
}
