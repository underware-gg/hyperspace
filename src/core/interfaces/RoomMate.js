
class RoomMate {
  #room;

  constructor(room) {
    this.#room = room
  }

  get remoteStore() {
    return this.#room.remoteStore
  }

  get localStore() {
    return this.#room.localStore
  }

  get agentId() {
    return this.#room.clientRoom.agentId
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

}

export default RoomMate
