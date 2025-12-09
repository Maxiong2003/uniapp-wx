<template>
  <view class="page">
      <view class="title">通讯录
        <button class="createGroupBtn" @click="openCreateGroup">建群</button>
      </view>
      <view class="list">
        <block v-for="item in conversations" :key="item.id">
          <view class="row">
            <view class="left">
              <view class="avatar">{{ item.name.slice(-2) }}</view>
              <view class="meta">
                <text class="name">{{ item.name }}</text>
                <text class="desc">{{ item.lastMessage }}</text>
              </view>
            </view>
            <view class="action">
              <button @click.stop="openChat(item)">发送信息</button>
            </view>
          </view>
        </block>
      </view>

      <view v-if="showCreate" class="createModal">
        <view class="modalInner">
          <view class="modalHeader">创建群聊</view>
          <input v-model="groupName" placeholder="群名称 (可选)" />
          <view class="members">
            <block v-for="item in conversations" :key="item.id">
              <view class="memberRow" @click="toggleSelect(item)">
                <view class="memberLeft">
                  <view class="memberAvatar">{{ item.name.slice(-2) }}</view>
                  <view class="memberInfo">
                    <text class="mname">{{ item.name }}</text>
                    <text class="mdesc">{{ item.lastMessage || '' }}</text>
                  </view>
                </view>
                <view class="memberRight">
                  <view class="fakeCheck" :class="{checked: selected.indexOf(item.id) !== -1}" @click.stop="toggleSelect(item)"></view>
                </view>
              </view>
            </block>
          </view>
          <view class="modalActions">
            <button @click="cancelCreate">取消</button>
            <button @click="createGroup">创建并进入</button>
          </view>
        </view>
      </view>
    <bottom-nav current="contacts" />
  </view>
</template>

<script>
import BottomNav from '@/components/BottomNav.vue'
import chatData from '../../common/chat-data.js'
export default {
  components: { BottomNav },
  data() {
    return {
      conversations: [],
      showCreate: false,
      selected: [],
      groupName: ''
    }
  },
  onShow() {
    // 加载持久化会话
    chatData.load && chatData.load()
    this.conversations = chatData.getConversations()
    this.selected = []
    this.groupName = ''
  },
  methods: {
    openChat(item) {
      // 导航到联系人聊天页面
      uni.navigateTo({ url: `/pages/chat/index?chatId=${item.id}&name=${encodeURIComponent(item.name)}` })
    },
    openCreateGroup() {
      this.showCreate = true
      this.selected = []
    },
    cancelCreate() {
      this.showCreate = false
      this.groupName = ''
      this.selected = []
    },
    toggleSelect(item) {
      const id = item.id
      const idx = this.selected.indexOf(id)
      if (idx === -1) this.selected.push(id)
      else this.selected.splice(idx, 1)
    },
    // 选择素来自对象的 v-model 绑定
    createGroup() {
      if (!this.selected.length) {
        uni.showToast({ title: '请选择至少一个联系人', icon: 'none' })
        return
      }
      const gid = chatData.createGroup(this.groupName, this.selected)
      this.showCreate = false
      this.groupName = ''
      this.selected = []
      // navigate to the new group chat
      uni.navigateTo({ url: `/pages/chat/index?chatId=${gid}&name=${encodeURIComponent('群聊')}` })
    }
  }
}
</script>

<style scoped>
.page{padding:12px;padding-bottom:110px;background:#fff}
.title{font-size:30px;font-weight:700;margin-bottom:10px;color:#111}
.list{background:#fff}
.row{display:flex;align-items:center;justify-content:space-between;padding:12px 8px;border-bottom:1px solid #f4f4f6}
.left{display:flex;align-items:center;flex:1}
.avatar{width:56rpx;height:56rpx;border-radius:28rpx;background:linear-gradient(135deg,#6dd3ff,#2fb86b);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;margin-right:12rpx;font-size:24rpx;box-shadow:0 6px 18px rgba(47,184,107,0.12)}
.meta{display:flex;flex-direction:column}
.name{font-size:28rpx;color:#111;margin-bottom:6rpx}
.desc{font-size:22rpx;color:#8a8a8a}
.action button{background:#007AFF;color:#fff;border:none;padding:2px 6px;border-radius:18px;font-size:22rpx}

.createGroupBtn{float:right;background:#fff;border:none;color:#007AFF;padding:0px 20px;border-radius:6px;margin-left:10px}
.createModal{position:fixed;left:0;right:0;top:0;bottom:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:2000}
.modalInner{width:92%;max-height:80vh;background:#fff;border-radius:12px;padding:14px;box-shadow:0 8px 30px rgba(0,0,0,0.15)}
.modalHeader{font-size:28px;font-weight:800;margin-bottom:12px;color:#111}
.members{max-height:50vh;overflow:auto;margin:8px 0;padding-right:6px}
.memberRow{display:flex;align-items:center;justify-content:space-between;padding:10px 6px;border-bottom:1px solid #f4f4f6}
.memberLeft{display:flex;align-items:center}
.memberAvatar{width:48rpx;height:48rpx;border-radius:24rpx;background:linear-gradient(135deg,#89f7fe,#66a6ff);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;margin-right:12rpx;font-size:22rpx}
.memberInfo{display:flex;flex-direction:column}
.mdesc{font-size:20rpx;color:#9a9a9a;margin-top:4rpx}
.memberRight{width:64rpx;display:flex;align-items:center;justify-content:center;position:relative}
.fakeCheck{width:36rpx;height:36rpx;border-radius:8px;border:1px solid #ddd;display:flex;align-items:center;justify-content:center;font-size:22rpx;color:transparent;cursor:pointer}
.fakeCheck.checked{background:#007AFF;border-color:#007AFF;color:#fff}
.fakeCheck.checked::after{content:'✓';font-size:20px;color:#fff}
.modalActions{display:flex;justify-content:space-between;margin-top:12px}
.modalActions .btn{flex:1;padding:10px 14px;border-radius:8px;font-size:26rpx}
.modalActions .btn + .btn{margin-left:12px}
.btn.secondary{background:#fff;border:1px solid #ddd;color:#333}
.btn.primary{background:#007AFF;color:#fff;border:none}

</style>

