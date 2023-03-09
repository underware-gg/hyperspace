
// objects created inside Room
// share the Room client and stores
// can access to other objects

class RoomMate {
  #room;

  constructor(room) {
    this.#room = room
  }

  get slug() {
    return this.#room.clientRoom.slug
  }

  get agentId() {
    return this.#room.clientRoom.agentId
  }

  get clientRoom() {
    return this.#room.clientRoom
  }

  get remoteStore() {
    return this.#room.remoteStore
  }

  get localStore() {
    return this.#room.localStore
  }

  get Player() {
    return this.#room.Player
  }

  get Profile() {
    return this.#room.Profile
  }

  get Permission() {
    return this.#room.Permission
  }

  get Settings() {
    return this.#room.Settings
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
