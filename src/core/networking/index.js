import ClientRoom from './client-room'
import { serverUrl } from './config'

// Create a Room
export const create = (options) => {
  return new ClientRoom(serverUrl, options)
}
