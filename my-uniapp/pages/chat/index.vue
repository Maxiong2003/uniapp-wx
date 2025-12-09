<template>
  <view class="page">

    <!-- 消息区 -->
    <scroll-view
      class="messages"
      scroll-y
      :scroll-into-view="scrollIntoView"
    >
      <block v-for="(m, idx) in messages" :key="m.id">
        <view
          :id="'m-' + idx"
          :class="['message', m.from === 'me' ? 'me' : 'them']"
        >
          <view class="bubble" :class="m.from">
            <block v-if="m.type === 'text'">
              {{ m.text }}
            </block>

            <block v-else-if="m.type === 'image'">
              <image
                :src="m.path"
                class="msg-image"
                mode="aspectFill"
                @click.stop="preview(m.path)"
              />
            </block>

            <block v-else-if="m.type === 'audio'">
              <view class="audioBox" @click.stop="playAudio(m)">
                ▶ 点击播放语音
              </view>
            </block>
          </view>

          <text class="time">{{ m.time }}</text>
        </view>
      </block>
    </scroll-view>

    <!-- Emoji 面板 -->
    <view class="emojiPanel" v-if="showEmoji">
      <view class="emojiGrid">
        <view
          v-for="e in emojis"
          :key="e"
          class="emojiCell"
          @click="addEmoji(e)"
        >
          {{ e }}
        </view>
      </view>
    </view>

    <!-- 录音覆盖层 -->
    <view v-if="recording" class="recordingOverlay">
      <view class="recordingBox">
        <view class="waveformContainer">
          <view v-for="i in 5" :key="i" :class="['wave', 'wave' + i]"></view>
        </view>
        <text class="recordingTime">{{ recordingTime }}秒</text>
        <text v-if="recordingTime >= 50" class="recordingWarning">即将达到60秒限制</text>
      </view>
    </view>

  <!-- 顶部拨号按钮） -->
  <view class="callButtonContainer">
    <view class="callButton" @click="makeCall">📞</view>
  </view>

  <!-- 输入栏 -->
  <view class="inputBar">
      <view class="leftBtns">
        <view class="iconBtn" @click="pickImage">📷</view>
        <view 
          class="iconBtn recordBtn" 
          :class="{recording: recording, pressed: recordButtonPressed}"
          @touchstart="startRecordingPress"
          @touchend="endRecordingPress"
        >🎤</view>
        <view class="iconBtn" @click="toggleEmoji">😊</view>
      </view>

      <input
        class="input"
        v-model="text"
        placeholder="输入消息…"
        @confirm="send"
      />

      <button class="send" @click="send">发送</button>
    </view>

  </view>
</template>

<script>
import chatData from '../../common/chat-data.js'

export default {
  data() {
    return {
      chatId: '',
      name: '',
      messages: [],
      text: '',
      scrollIntoView: '',
      showEmoji: false,
      emojis: ['😀','😊','😂','😍','😭','👍','🔥','🎉','🥲','🙏'],
      recording: false,
      recordButtonPressed: false,
      recordingTime: 0,
      recordingTimer: null,
      recordingStartTime: 0,
      recorderManager: null,
      audioCtx: null
    }
  },

  onLoad(options) {
    this.chatId = options.chatId
    this.name = options.name ? decodeURIComponent(options.name) : ''
    uni.setNavigationBarTitle({ title: this.name || '聊天' })

    // 设置导航栏右侧按钮
    uni.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#FFFFFF'
    })
        // 兼容性处理：添加电话按钮
        try {
          if (uni.setNavigationBarRightButton) {
            uni.setNavigationBarRightButton({
              text: '📞',
              color: '#000000'
            })
          } else {
            console.log('当前环境不支持setNavigationBarRightButton API，将在界面内添加拨号按钮')
          }
        } catch (e) {
          console.warn('设置导航栏按钮失败:', e)
        }

    chatData.load && chatData.load()
    this.messages = chatData.getMessages(this.chatId) || []
  },

    onNavigationBarButtonTap(e) {
      // 兼容性处理：按钮点击事件
      if (e && e.index === 0) {
        this.makeCall()
      } else if (e && e.type === 'tap') {
        this.makeCall()
      }
    },

  onShow() {
    this.$nextTick(() => this._scrollToBottom())
  },

  onUnload() {
    clearInterval(this.recordingTimer)
    if (this.recording) {
      this.stopRecord()
    }
  },

  methods: {
    send() {
      const t = this.text.trim()
      if (!t) return

      const msg = {
        id: Date.now(),
        from: 'me',
        type: 'text',
        text: t,
        time: this._formatTime(new Date())
      }

      this.messages.push(msg)
      chatData.addMessage(this.chatId, msg)
      this.text = ''
      this._scrollToBottom()

      // 模拟回复
      setTimeout(() => {
        const reply = {
          id: Date.now() + '-r',
          from: 'them',
          type: 'text',
          text: '（自动回复）收到：' + msg.text,
          time: this._formatTime(new Date())
        }
        this.messages.push(reply)
        chatData.addMessage(this.chatId, reply)
        this._scrollToBottom()
      }, 700)
    },

    pickImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          const path = res.tempFilePaths[0]
          const msg = {
            id: Date.now(),
            from: 'me',
            type: 'image',
            path,
            time: this._formatTime(new Date())
          }
          this.messages.push(msg)
          chatData.addMessage(this.chatId, msg)
          this._scrollToBottom()
        }
      })
    },

    startRecordingPress() {
      this.recordButtonPressed = true
      // 延迟500ms以区分长按和点击
      setTimeout(() => {
        if (this.recordButtonPressed && !this.recording) {
          this.startRecord()
        }
      }, 500)
    },

    endRecordingPress() {
      this.recordButtonPressed = false
      if (this.recording) {
        this.stopRecord()
      }
    },

    startRecord() {
      if (!this.recorderManager) {
        this.recorderManager = uni.getRecorderManager()
      }

      this.recorderManager.start({ format: 'mp3' })
      this.recording = true
      this.recordingStartTime = Date.now()
      this.recordingTime = 0

      // 每秒更新录音时长
      this.recordingTimer = setInterval(() => {
        this.recordingTime = Math.floor((Date.now() - this.recordingStartTime) / 1000)
        // 60秒自动停止
        if (this.recordingTime >= 60) {
          this.stopRecord()
        }
      }, 100)

      this.recorderManager.onStop((res) => {
        clearInterval(this.recordingTimer)
        const msg = {
          id: Date.now(),
          from: 'me',
          type: 'audio',
          path: res.tempFilePath,
          time: this._formatTime(new Date())
        }

        this.messages.push(msg)
        chatData.addMessage(this.chatId, msg)
        this.recording = false
        this.recordingTime = 0
        this._scrollToBottom()
      })
    },

    stopRecord() {
      clearInterval(this.recordingTimer)
      this.recorderManager && this.recorderManager.stop()
      this.recording = false
      this.recordingTime = 0
    },

    playAudio(m) {
      if (!this.audioCtx) {
        this.audioCtx = uni.createInnerAudioContext()
      }
      this.audioCtx.src = m.path
      this.audioCtx.play()
    },

    preview(path) {
      uni.previewImage({ urls: [path] })
    },

    addEmoji(e) {
      this.text += e
      this.showEmoji = false
    },

    toggleEmoji() {
      this.showEmoji = !this.showEmoji
    },

    makeCall() {
      uni.showModal({
        title: '拨打电话',
        content: `即将拨打给 ${this.name}，是否继续？`,
        confirmText: '拨打',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            uni.makePhoneCall({
              phoneNumber: '10086', // 实际应用中替换为真实电话号码
              success: () => {
                uni.showToast({
                  title: `正在拨打给 ${this.name}...`,
                  icon: 'none',
                  duration: 2000
                })
              },
              fail: () => {
                uni.showToast({
                  title: '拨号失败',
                  icon: 'none',
                  duration: 2000
                })
              }
            })
          }
        }
      })
    },

    _formatTime(d) {
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    },

    _scrollToBottom() {
      this.$nextTick(() => {
        this.scrollIntoView = 'm-' + (this.messages.length - 1)
      })
    },

  }
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f6f6f6;
}

/* 消息区 */
.messages {
  flex: 1;
  padding: 16px 14px 120px;
  background: #f6f6f6;
}

/* 单条消息 */
.message {
  display: flex;
  flex-direction: column;
  margin: 10px 0;
  max-width: 78%;
}

.message.me {
  align-self: flex-end;
  align-items: flex-end;
}
.message.them {
  align-self: flex-start;
  align-items: flex-start;
}

/* 气泡 */
.bubble {
  padding: 10px 14px;
  border-radius: 16px;
  line-height: 1.5;
  font-size: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  word-break: break-word;
}
.bubble.me {
  background: #95ec69;
}
.bubble.them {
  background: #ffffff;
}

/* 图片消息 */
.msg-image {
  width: 180px;
  height: 130px;
  border-radius: 12px;
}

/* 语音消息 */
.audioBox {
  background: #ffffff;
  padding: 8px 14px;
  border-radius: 16px;
  color: #3c9cff;
  font-size: 14px;
}

/* 时间 */
.time {
  font-size: 11px;
  color: #a0a0a0;
  margin-top: 6px;
}

/* 顶部拨号按钮 */
.callButtonContainer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  border-bottom: 1px solid #ececec;
  z-index: 1000;
}

.callButton {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  color: #007aff;
  font-size: 16px;
  font-weight: 500;
  background: #f8f9fa;
  margin: 8px 16px;
  border-radius: 8px;
  border: 1px solid #007aff;
}

.callButton:active {
  background: #e6f3ff;
}

/* 输入栏（底部） */
.inputBar {
  padding-top: 60px; /* 为顶部拨号按钮留出空间 */
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 62px;
  display: flex;
  align-items: center;
  padding: 8px 10px;
  background: #ffffff;
  border-top: 1px solid #ececec;
}

/* 左侧按钮 */
.leftBtns {
  display: flex;
  align-items: center;
  margin-right: 8px;
}

.iconBtn {
  width: 40px;
  height: 40px;
  background: #fafafa;
  border-radius: 10px;
  margin-right: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

/* 输入框 */
.input {
  flex: 1;
  height: 40px;
  padding: 6px 12px;
  background: #f5f5f5;
  border-radius: 20px;
  font-size: 14px;
  margin-right: 8px;
}

/* 发送按钮 */
.send {
  height: 40px;
  min-width: 60px;
  padding: 0 14px;
  border-radius: 20px;
  background: #007aff;
  color: #fff;
  font-weight: 500;
}

/* Emoji 面板 */
.emojiPanel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 62px;
  background: #fff;
  border-top: 1px solid #eee;
  padding: 12px 10px;
}

.emojiGrid {
  display: flex;
  flex-wrap: wrap;
}

.emojiCell {
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fafafa;
  border-radius: 10px;
  margin: 6px;
  font-size: 22px;
}

/* 录音覆盖层 */
.recordingOverlay {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.recordingBox {
  background: #fff;
  border-radius: 20px;
  padding: 40px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.waveformContainer {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  height: 100px;
  margin-bottom: 24px;
}

.wave {
  width: 6px;
  background: linear-gradient(to top, #007aff, #00d4ff);
  border-radius: 3px;
  animation: waveAnimation 0.6s ease-in-out infinite;
}

.wave1 { animation-delay: 0s; }
.wave2 { animation-delay: 0.1s; }
.wave3 { animation-delay: 0.2s; }
.wave4 { animation-delay: 0.1s; }
.wave5 { animation-delay: 0s; }

@keyframes waveAnimation {
  0%, 100% { height: 20px; }
  50% { height: 60px; }
}

.recordingTime {
  font-size: 28px;
  font-weight: 700;
  color: #111;
  margin-bottom: 12px;
}

.recordingWarning {
  font-size: 14px;
  color: #ff4d4f;
  margin-top: 8px;
}

/* 录音按钮样式 */
.recordBtn {
  transition: all 0.15s ease;
}

.recordBtn.pressed {
  background: #e0e0e0;
  transform: scale(0.92);
}

.recordBtn.recording {
  background: linear-gradient(135deg, #ff4d4f, #ff7a7a);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.3);
  animation: recordingPulse 1.2s ease-in-out infinite;
}

@keyframes recordingPulse {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(255, 77, 79, 0.3);
  }
  50% {
    box-shadow: 0 2px 12px rgba(255, 77, 79, 0.6);
  }
}
</style>
