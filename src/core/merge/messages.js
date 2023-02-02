export const createMessage = {
  ping: () => ({
    type: 'ping',
  }),
  pong: () => ({
    type: 'pong',
  }),
  connect: (agentId, ops) => ({
    type: 'connect',
    agentId,
    ops,
  }),
  patch: (ops) => ({
    type: 'patch',
    ops,
  }),
  connected: (agentId) => ({
    type: 'connected',
    agentId,
  }),
  disconnected: (agentId) => ({
    type: 'disconnected',
    agentId,
  }),
}
