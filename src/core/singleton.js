//-------------------------------
// DEPRECATION WARNING
//
// The singleton Stores will be removed soon
// avoid using it!
//
import Store from '@/core/store'

const localStore = new Store()
const remoteStore = new Store()

export const getLocalStore = () => localStore
export const getRemoteStore = () => remoteStore
