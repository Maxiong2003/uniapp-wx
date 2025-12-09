<template>
  <view class="page">
    <!-- 个人资料卡片 -->
    <view class="profileCard">
      <view class="avatar">我</view>
      <view class="nameArea">
        <view class="name">示例用户</view>
        <view class="uid">ID: 10001</view>
      </view>
    </view>

    <!-- 功能区卡片 -->
    <view class="actionCard">
      <view class="item" hover-class="item-active">设置</view>
      <view class="item" hover-class="item-active">关于</view>
    </view>

    <bottom-nav current="me" />
  </view>
</template>

<script>
import BottomNav from '@/components/BottomNav.vue'
export default {
  components: { BottomNav },
  data() {
    return {}
  }
}
</script>

<style scoped>
/* 页面背景 */
.page {
  padding: 20px;
  padding-bottom: 80px;
  background: #f6f6f6;
}

/* ——个人卡片—— */
.profileCard {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  margin-bottom: 18px;
}

/* 头像 */
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background: linear-gradient(135deg, #7f7aff, #695df1);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 26px;
  margin-right: 14px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

.nameArea {
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
}

.uid {
  font-size: 14px;
  color: #9c9c9c;
}

/* ——功能区卡片—— */
.actionCard {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.item {
  padding: 16px;
  font-size: 16px;
  border-bottom: 1px solid #f2f2f2;
}

.item:last-child {
  border-bottom: none;
}

.item-active {
  background: #f0f0f0;
}
</style>
