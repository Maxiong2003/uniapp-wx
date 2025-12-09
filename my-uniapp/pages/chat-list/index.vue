<template>
  <view class="page">
    <view class="searchBar">
        <input v-model="q" placeholder="搜索会话/消息" @input="onSearch" />
      </view>
      <view class="list">
        <block v-for="item in conversationsFiltered" :key="item.id">
          <view class="row">
            <view class="left" @click="openChat(item)">
              <view class="avatar">{{ item.name.slice(-2) }}</view>
              <view class="meta">
                <view class="top">
                  <text class="name">{{ item.name }}</text>
                  <text class="time"> </text>
                </view>
                <view class="bottom">
                  <text class="last">{{ item.lastMessage }}</text>
                  <text class="badge" v-if="item.unread">{{ item.unread }}</text>
                </view>
              </view>
            </view>
            <view class="actions">
              <button @click.stop="togglePin(item)">{{ item.pinned ? '取消置顶' : '置顶' }}</button>
              <button @click.stop="del(item)" class="danger">删除</button>
            </view>
          </view>
        </block>
      </view>
    <bottom-nav current="index" />
  </view>
</template>

<script>
import chatData from '../../common/chat-data.js'
import BottomNav from '@/components/BottomNav.vue'
export default {
  components: { BottomNav },
  data() {
    return {
      conversations: [],
      q: ''
    }
  },
  computed: {
    conversationsFiltered() {
      const list = this.q ? chatData.searchConversations(this.q) : chatData.getConversations()
      // 置顶的会话排在前面
      list.sort((a, b) => (b.pinned === true) - (a.pinned === true) || 0)
      return list
    }
  },
  methods: {
    openChat(item) {
      uni.navigateTo({ url: `/pages/chat/index?chatId=${item.id}&name=${encodeURIComponent(item.name)}` })
    },
    onSearch() {
      // 计算属性处理筛选
    },
    togglePin(item) {
      chatData.pinConversation(item.id, !item.pinned)
      this.refresh()
    },
    del(item) {
      uni.showModal({ title: '删除会话', content: `确定删除与 ${item.name} 的会话吗？`, success: (res) => {
        if (res.confirm) {
          chatData.deleteConversation(item.id)
          this.refresh()
        }
      }})
    },
    refresh() {
      this.conversations = chatData.getConversations()
    }
  }
  ,
  onShow() {
    chatData.load && chatData.load()
    this.refresh()
  }
}
</script>
<style scoped>
.page{padding:0 12px;padding-bottom:80px}
.searchBar{padding:10px 0}
.searchBar input{width:100%;height:36px;padding:6px 10px;border-radius:18px;background:#fff}
.row{display:flex;align-items:center;padding:12px 0;border-bottom:1px solid #eee;justify-content:space-between}
.left{display:flex;align-items:center;flex:1}
.avatar{width:48px;height:48px;border-radius:24px;background:linear-gradient(135deg,#6dd3ff,#8e7eff);color:#fff;display:flex;align-items:center;justify-content:center;margin-right:12px;font-weight:700}
.name{font-weight:600}
.last{color:#666}
.badge{background:#f44;color:#fff;border-radius:10px;padding:2px 6px;margin-left:8px;font-size:12px}
.meta{flex:1}
.top{display:flex;justify-content:space-between}
.bottom{display:flex;align-items:center;justify-content:space-between;margin-top:6px}
.actions button{margin-left:6px}
.actions .danger{background:#ff4d4f;color:#fff}
</style>

