
<template>
  <view class="bottom">
    <view class="tab" @click="go('index')">
      <image src="/static/icons/msg.svg" class="icon" />
      <text :class="['label', current==='index' ? 'active' : '']">消息</text>
    </view>
    <view class="tab" @click="go('contacts')">
      <image src="/static/icons/contacts.svg" class="icon" />
      <text :class="['label', current==='contacts' ? 'active' : '']">通讯录</text>
    </view>
    <view class="tab" @click="go('me')">
      <image src="/static/icons/me.svg" class="icon" />
      <text :class="['label', current==='me' ? 'active' : '']">我</text>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    current: { type: String, default: 'index' }
  },
  methods: {
    go(name) {
      // 使用切换标签模式切换页面
      const map = { index: '/pages/index/index', contacts: '/pages/contacts/index', me: '/pages/me/index' }
      const url = map[name]
      if (!url) return
      // 使用 reLaunch 可靠地切换到根页面（替换栈）
      // 避免页面底部导航时堆积重复页面
      try {
        uni.reLaunch({ url })
      } catch (e) {
        // reLaunch 不支持时回退到 navigateTo
        try {
          uni.navigateTo({ url })
        } catch (err) {
          console && console.error && console.error('导航失败', err)
        }
      }
    }
  }
}    
</script>

<style scoped>
.bottom{position:fixed;left:0;right:0;bottom:0;height:60px;background:#fff;border-top:1px solid #eee;display:flex;justify-content:space-around;align-items:center;z-index:1000}
.tab{display:flex;flex-direction:column;align-items:center;justify-content:center}
.icon{width:26px;height:26px}
.label{font-size:12px;color:#8a8a8a;margin-top:4px}
.label.active{color:#007AFF}
</style>

