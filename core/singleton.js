import Store from './store'

const localStore = new Store()
const remoteStore = new Store()

export const getLocalStore = () => localStore
export const getRemoteStore = () => remoteStore
