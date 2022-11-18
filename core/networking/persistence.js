import { nanoid } from 'nanoid'

export const getAgentId = () => {
  const existingAgentId = localStorage.getItem('agentId')
  let agentId = existingAgentId

  if (existingAgentId === null) {
    agentId = nanoid()
    localStorage.setItem('agentId', agentId)
  }

  return agentId
}

export const setSnapshot = (id, snapshot) => {
  localStorage.setItem(`snapshot:${id}`, JSON.stringify(snapshot))
}

export const getSnapshot = (id) => {
  const snapshot = localStorage.getItem(`snapshot:${id}`)
  if (snapshot === null) {
    return []
  }

  return JSON.parse(snapshot)
}
