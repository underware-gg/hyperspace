
class RoomMate {
  #room;

  constructor(room) {
    this.#room = room
  }

  get remoteStore() {
    return this.#room.remoteStore;
  }

  get localStore() {
    return this.#room.localStore;
  }

  get agentId() {
    return this.#room.clientRoom.agentId;
  }
}

export default RoomMate
