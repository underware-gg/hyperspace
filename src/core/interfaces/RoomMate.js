
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
