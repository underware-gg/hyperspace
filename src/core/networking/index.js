import ClientRoom from './client-room'
import { getServerUrl } from './config'

// Create a Room
export const create = (options) => {
  return new ClientRoom(getServerUrl(), options)
}
