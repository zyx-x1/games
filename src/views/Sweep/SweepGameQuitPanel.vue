<template>
  <!-- 游戏结束提示框 -->
  <div class="game-tips-quit-container">
    <div class="game-tips-quit">
      <div class="game-tips-quit-head">
        <div class="game-tips-quit-title">游戏结束</div>
        <div
          class="game-tips-quit-close"
          @mouseover="isCloseHover = true"
          @mouseleave="isCloseHover = false"
          @click="closeQuitPanel()"
        >
          <CloseBlack v-show="!isCloseHover"></CloseBlack>
          <CloseWhite v-show="isCloseHover"></CloseWhite>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import CloseBlack from "@/components/close-black.vue";
import CloseWhite from "@/components/close-white.vue";
export default {
  components: { CloseBlack, CloseWhite },
  data() {
    return {
      isCloseHover: false,
    };
  },
  methods: {
    closeQuitPanel() {
      this.$store.state.isSweepGameQuitPanelShow = false;
    },
  },
};
</script>

<style lang="less">
.game-tips-quit-container {
  width: 100%;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.2);
  .game-tips-quit {
    width: 50%;
    height: 50%;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 20px 10px rgba(0, 0, 0, 0.1);
    background-color: #fff;
    .game-tips-quit-head {
      padding: 10px 0;
      user-select: none;
      position: relative;
      border-bottom: 1px solid #000;
      .game-tips-quit-close {
        width: 60px;
        height: 37px;
        position: absolute;
        right: 0;
        top: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        &:hover {
          background-color: rgba(247, 49, 49, 1);
          color: #fff;
        }
        svg {
          width: 20px;
          height: 20px;
          &:hover {
            color: #fff;
          }
        }
      }
    }
  }
}
</style>
