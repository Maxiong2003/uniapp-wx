<template>
  <view class="page">
    <view class="nav">
      <text class="nav-title">微信</text>
      <view class="nav-actions">
        <text class="action">+</text>
      </view>
    </view>

    <view class="searchWrap">
      <input class="search" placeholder="搜索" v-model="q" @input="onSearch" />
    </view>

    <scroll-view class="list" scroll-y>
      <block v-for="item in conversationsFiltered" :key="item.id">
        <view class="chatRow" @click="openChat(item)">
          <view class="avatar">{{ item.name.slice(-2) }}</view>
          <view class="chatMeta">
            <view class="metaTop">
              <text class="name">{{ item.name }}</text>
              <text class="time">{{ item.time || '' }}</text>
            </view>
            <view class="metaBottom">
              <text class="last">{{ item.lastMessage }}</text>
              <text class="badge" v-if="item.unread">{{ item.unread }}</text>
            </view>
          </view>
        </view>
      </block>
    </scroll-view>
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
      return list
    }
  },
  onShow() {
    chatData.load && chatData.load()
    this.conversations = chatData.getConversations()
  },
  methods: {
    openChat(item) {
      uni.navigateTo({ url: `/pages/chat/index?chatId=${item.id}&name=${encodeURIComponent(item.name)}` })
    },
    onSearch() {}
  }
}
</script>


<style scoped>
  .page{background:#fff;height:100%;display:flex;flex-direction:column;padding-bottom:80px}
  /* Other styles remain unchanged */
  .nav { height: 50rpx; padding-top: 30rpx; background: #f8f8f8; display: flex; align-items: center; justify-content: center; position: relative; }
  .nav-title { font-size: 36rpx; font-weight: 700; }
  .nav-actions { position: absolute; right: 14rpx; top: 30rpx; }
  .action { font-size: 32rpx; color: #333; }
  /* ... other styles ... */
/* 导航栏样式 */
.nav { height: 50rpx; padding-top: 30rpx; background: #f8f8f8; display: flex; align-items: center; justify-content: center; position: relative; }
.nav-title { font-size: 36rpx; font-weight: 700; }
.nav-actions { position: absolute; right: 14rpx; top: 30rpx; }
.action { font-size: 32rpx; color: #333; }

/* 搜索框样式 */
.searchWrap { padding: 10rpx 12rpx; background: #f8f8f8; }
.search { width: 98%; height: 30rpx; border-radius: 10rpx; padding: 10rpx 12rpx; background: #fff; border: 1px solid #eee; }

/* 列表样式 */
.list { flex: 1; background: #fff; }
.chatRow { display: flex; padding: 18rpx 14rpx; border-bottom: 1px solid #f1f1f1; align-items: center; }
.avatar { width: 88rpx; height: 88rpx; border-radius: 10rpx; background: linear-gradient(135deg, #6dd3ff, #2fb86b); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; margin-right: 12rpx; }
.chatMeta { flex: 1; }
.metaTop { display: flex; justify-content: space-between; align-items: center; }
.name { font-size: 30rpx; color: #111; }
.time { font-size: 22rpx; color: #999; }
.metaBottom { display: flex; justify-content: space-between; align-items: center; margin-top: 8rpx; }
.last { color: #8a8a8a; font-size: 26rpx; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.badge { background: #f44336; color: #fff; padding: 4rpx 10rpx; border-radius: 16rpx; margin-left: 8rpx; font-size: 20rpx; }
</style>

