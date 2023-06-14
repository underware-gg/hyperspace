// objects created inside Room
// share the Room client and stores
// can access other objects

class RoomMate {
  #room;

  constructor(room) {
    this.#room = room
  }

  // the Room

  get canvas2d() {
    return this.#room.canvas2d
  }

  get canvas3d() {
    return this.#room.canvas3d
  }

  get localStore() {
    return this.#room.localStore
  }

  get remoteStore() {
    return this.#room.remoteStore
  }

  get sessionStore() {
    return this.#room.sessionStore
  }

  get agentStore() {
    return this.#room.agentStore
  }

  get actions() {
    return this.#room.actions
  }

  // the ClientRoom

  get clientRoom() {
    return this.#room.clientRoom ?? null
  }

  get slug() {
    return this.#room.clientRoom?.slug ?? null
  }

  get agentId() {
    return this.#room.clientAgent?.agentId ?? null
  }

  // get clientSession() {
  //   return this.#room.clientSession
  // }

  // get clientAgent() {
  //   return this.#room.clientAgent
  // }

  // get clientMetadata() {
  //   return this.#room.clientMetadata
  // }

  // other RoomMates

  get Settings() {
    return this.#room.Settings
  }

  get Permission() {
    return this.#room.Permission
  }

  get Player() {
    return this.#room.Player
  }

  get Profile() {
    return this.#room.Profile
  }

  get Wallet() {
    return this.#room.Wallet
  }

  get Tileset() {
    return this.#room.Tileset
  }

  get Portal() {
    return this.#room.Portal
  }

  get Trigger() {
    return this.#room.Trigger
  }

  get Screen() {
    return this.#room.Screen
  }

  get Map() {
    return this.#room.Map
  }

  get Editor() {
    return this.#room.Editor
  }

}

export default RoomMate
