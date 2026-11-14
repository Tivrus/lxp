const online = new Map()

function addConnection(user) {
  const entry = online.get(user.id)
  if (entry) {
    entry.connections++
    return false
  }
  online.set(user.id, { user, connections: 1 })
  return true
}

function removeConnection(user) {
  const entry = online.get(user.id)
  if (!entry) return false
  entry.connections--
  if (entry.connections > 0) return false
  online.delete(user.id)
  return true
}

function onlineUsers() {
  return [...online.values()].map((entry) => entry.user)
}

module.exports = { addConnection, removeConnection, onlineUsers }
