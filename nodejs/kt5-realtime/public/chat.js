const GENERAL = ''

const $ = (id) => document.getElementById(id)

let token = null
let me = null
let socket = null
let current = GENERAL
const rooms = new Map([[GENERAL, []]])
const online = new Map()

async function api(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })
  const body = res.status === 204 ? null : await res.json()
  if (!res.ok) throw new Error(body?.error ?? `Ошибка ${res.status}`)
  return body
}

async function refresh() {
  const data = await api('/auth/refresh', { method: 'POST' })
  token = data.accessToken
  me = data.user
}

function time(iso) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function renderTabs() {
  $('tabs').replaceChildren(
    ...[...rooms.keys()].map((room) => {
      const button = document.createElement('button')
      button.textContent = room === GENERAL ? 'общий' : `#${room}`
      button.className = room === current ? 'active' : ''
      button.onclick = () => {
        current = room
        renderTabs()
        renderMessages()
      }
      if (room !== GENERAL) {
        button.ondblclick = () => leaveRoom(room)
        button.title = 'двойной клик чтобы выйти'
      }
      return button
    }),
  )
}

function renderMessages() {
  const list = $('messages')
  list.replaceChildren(
    ...rooms.get(current).map((item) => {
      const li = document.createElement('li')
      if (item.system) {
        li.className = 'system'
        li.textContent = item.system
      } else {
        const t = document.createElement('span')
        t.className = 'time'
        t.textContent = time(item.createdAt) + ' '
        const name = document.createElement('b')
        name.textContent = item.author.name + ': '
        li.append(t, name, item.text)
      }
      return li
    }),
  )
  list.scrollTop = list.scrollHeight
}

function renderOnline() {
  $('online').replaceChildren(
    ...[...online.values()].map((user) => {
      const li = document.createElement('li')
      li.textContent = user.id === me.id ? `${user.name} (вы)` : user.name
      return li
    }),
  )
}

function push(room, item) {
  if (!rooms.has(room)) return
  rooms.get(room).push(item)
  if (room === current) renderMessages()
}

function showError(text) {
  $('chat-error').textContent = text ?? ''
}

function connect() {
  socket = io({ auth: { token } })

  socket.on('connect', () => {
    $('status').textContent = 'в сети'
    for (const room of rooms.keys()) {
      if (room !== GENERAL) socket.emit('room:join', { room })
    }
  })

  socket.on('disconnect', () => {
    $('status').textContent = 'нет соединения'
  })

  socket.on('connect_error', async (err) => {
    $('status').textContent = err.message
    try {
      await refresh()
      socket.auth.token = token
      socket.connect()
    } catch {
      logout()
    }
  })

  socket.on('users:list', (users) => {
    online.clear()
    users.forEach((user) => online.set(user.id, user))
    renderOnline()
  })

  socket.on('user:online', (user) => {
    online.set(user.id, user)
    renderOnline()
    push(GENERAL, { system: `${user.name} в сети` })
  })

  socket.on('user:offline', (user) => {
    online.delete(user.id)
    renderOnline()
    push(GENERAL, { system: `${user.name} теперь не в сети` })
  })

  socket.on('message:new', (message) => push(GENERAL, message))
  socket.on('room:message', (message) => push(message.room, message))
  socket.on('room:joined', ({ room, user }) => push(room, { system: `${user.name} теперь в комнате` }))
  socket.on('room:left', ({ room, user }) => push(room, { system: `${user.name} больше не в комнате` }))
}

async function start() {
  $('login').hidden = true
  $('chat').hidden = false
  $('me').textContent = me.name

  const { data } = await api('/api/messages')
  rooms.set(GENERAL, data)
  renderTabs()
  renderMessages()
  connect()
}

function leaveRoom(room) {
  socket.emit('room:leave', { room }, () => {
    rooms.delete(room)
    if (current === room) current = GENERAL
    renderTabs()
    renderMessages()
  })
}

async function logout() {
  socket?.disconnect()
  socket = null
  await api('/auth/logout', { method: 'POST' }).catch(() => {})
  token = null
  location.reload()
}

$('login').addEventListener('submit', async (event) => {
  event.preventDefault()
  const form = new FormData(event.target)
  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
    })
    token = data.accessToken
    me = data.user
    await start()
  } catch (err) {
    $('login-error').textContent = err.message
  }
})

$('send').addEventListener('submit', (event) => {
  event.preventDefault()
  const input = event.target.elements.text
  const text = input.value.trim()
  if (!text) return

  const [eventName, payload] =
    current === GENERAL ? ['message:send', { text }] : ['room:message', { room: current, text }]

  socket.emit(eventName, payload, (res) => {
    if (res.ok) {
      input.value = ''
      showError()
    } else {
      showError(res.error)
    }
  })
})

$('join').addEventListener('submit', (event) => {
  event.preventDefault()
  const input = event.target.elements.room
  const room = input.value.trim()
  if (!room) return

  socket.emit('room:join', { room }, (res) => {
    if (!res.ok) return showError(res.error)
    showError()
    rooms.set(res.room, res.history)
    current = res.room
    input.value = ''
    renderTabs()
    renderMessages()
  })
})

$('logout').addEventListener('click', logout)

refresh()
  .then(start)
  .catch(() => {})
