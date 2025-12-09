const STORAGE_KEY = 'CHAT_STORAGE_V1'

const defaultData = {
  conversations: [
    { id: '1', name: '小明', lastMessage: '今天怎么样？', unread: 2, pinned: false },
    { id: '2', name: '客服', lastMessage: '欢迎使用示例聊天', unread: 0, pinned: false },
    { id: '3', name: '小红', lastMessage: '我刚下班，等你', unread: 0, pinned: false },
    { id: '4', name: '李雷', lastMessage: '明天见', unread: 1, pinned: false },
    { id: '5', name: '王芳', lastMessage: '好的，谢谢', unread: 0, pinned: false }
    ,
    { id: '6', name: '赵强', lastMessage: '吃饭了吗？', unread: 0, pinned: false },
    { id: '7', name: '陈静', lastMessage: '项目进展如何？', unread: 0, pinned: false },
    { id: '8', name: '张伟', lastMessage: '周末聚会，参加吗？', unread: 0, pinned: false }
  ],
  messages: {
    '1': [
      { id: 'm1', from: 'them', type: 'text', text: '你好，我是小明', time: '09:00' },
      { id: 'm2', from: 'me', type: 'text', text: '嗨，你好！', time: '09:01' }
    ],
    '2': [
      { id: 'm1', from: 'them', type: 'text', text: '您好，请问有什么可以帮您？', time: '10:00' }
    ]
    ,
    '3': [
      { id: 'm1', from: 'them', type: 'text', text: '我刚下班，等你', time: '18:30' }
    ],
    '4': [
      { id: 'm1', from: 'them', type: 'text', text: '明天见', time: '20:00' }
    ],
    '5': [
      { id: 'm1', from: 'them', type: 'text', text: '好的，谢谢', time: '14:10' }
    ]
    ,
    '6': [
      { id: 'm1', from: 'them', type: 'text', text: '吃饭了吗？', time: '12:05' }
    ],
    '7': [
      { id: 'm1', from: 'them', type: 'text', text: '项目进展如何？', time: '11:20' }
    ],
    '8': [
      { id: 'm1', from: 'them', type: 'text', text: '周末聚会，参加吗？', time: '09:50' }
    ]
  }
}

let store = null

function load() {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    if (raw) {
      store = raw
      // 合并 defaultData 到已有的 store，使新添加的模拟联系人/消息显示
      try {
        let changed = false
        if (!store.conversations) store.conversations = []
        if (!store.messages) store.messages = {}
        defaultData.conversations.forEach(dc => {
          if (!store.conversations.find(c => c.id === dc.id)) {
            store.conversations.push(JSON.parse(JSON.stringify(dc)))
            changed = true
          }
        })
        Object.keys(defaultData.messages || {}).forEach(mid => {
          if (!store.messages[mid]) {
            store.messages[mid] = JSON.parse(JSON.stringify(defaultData.messages[mid]))
            changed = true
          }
        })
        if (changed) save()
      } catch (e) {
        // 忽略合并错误
      }
    } else {
      store = JSON.parse(JSON.stringify(defaultData))
      save()
    }
  } catch (e) {
    store = JSON.parse(JSON.stringify(defaultData))
    try { save() } catch (e) {}
  }
}

function save() {
  try {
    uni.setStorageSync(STORAGE_KEY, store)
  } catch (e) {
    console.warn('保存聊天数据失败', e)
  }
}

function ensureLoaded() {
  if (!store) load()
}

function getConversations() {
  ensureLoaded()
  return JSON.parse(JSON.stringify(store.conversations))
}

function getMessages(chatId) {
  ensureLoaded()
  return store.messages[chatId] ? JSON.parse(JSON.stringify(store.messages[chatId])) : []
}

function addMessage(chatId, msg) {
  ensureLoaded()
  if (!store.messages[chatId]) store.messages[chatId] = []
  store.messages[chatId].push(msg)
  // 更新会话的最后消息
  const conv = store.conversations.find(c => c.id === chatId)
  if (conv) {
    conv.lastMessage = (msg.type === 'text' ? msg.text : (msg.type === 'image' ? '[图片]' : '[语音]'))
    if (msg.from === 'them') conv.unread = (conv.unread || 0) + 1
  } else {
    // 如果会话不存在，创建会话
    store.conversations.push({ id: chatId, name: '未知', lastMessage: msg.text || '', unread: msg.from === 'them' ? 1 : 0, pinned: false })
  }
  save()
}

function updateConversation(chatId, patch) {
  ensureLoaded()
  const conv = store.conversations.find(c => c.id === chatId)
  if (conv) Object.assign(conv, patch)
  save()
}

function deleteConversation(chatId) {
  ensureLoaded()
  store.conversations = store.conversations.filter(c => c.id !== chatId)
  delete store.messages[chatId]
  save()
}

function pinConversation(chatId, pinned) {
  ensureLoaded()
  const conv = store.conversations.find(c => c.id === chatId)
  if (conv) conv.pinned = !!pinned
  save()
}

function createGroup(name, memberIds) {
  ensureLoaded()
  const id = 'g' + Date.now()
  const members = Array.isArray(memberIds) ? memberIds.slice() : []
  const conv = { id, name: name || ('群聊-' + id.slice(-4)), lastMessage: '', unread: 0, pinned: false, type: 'group', members }
  store.conversations.push(conv)
  store.messages[id] = [{ id: id + '-m1', from: 'system', type: 'text', text: `群 "${conv.name}" 已创建`, time: _now() }]
  save()
  return id
}

function _now() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function searchConversations(keyword) {
  ensureLoaded()
  if (!keyword) return getConversations()
  const k = keyword.toLowerCase()
  return store.conversations.filter(c => (c.name || '').toLowerCase().includes(k) || (c.lastMessage || '').toLowerCase().includes(k))
}

export default {
  load,
  save,
  getConversations,
  getMessages,
  addMessage,
  updateConversation,
  deleteConversation,
  pinConversation,
  searchConversations
  ,createGroup
}
