<template>
  <!-- 基数为15 * 8 -->
  <div id="sweep">
    <div id="sweep-head">
      <div class="sweep-head-left">
        <div>雷：{{ mineTotalCount }}</div>
        <div>标记：{{ tagTotalCount }}</div>
      </div>

      <div v-if="!isGameStart" class="handles">
        <div @click="openStartPanel()">开始</div>
      </div>
      <div v-else class="handles">
        <div @click="restart()">重新开始</div>
        <div @click="quitGame()">结束</div>
      </div>
      <div>用时：{{ usedTime }}s</div>
    </div>
    <div
      id="sweep-body"
      :style="{
        width: gridCellSize * 15 * level + 10 + 'px',
        height: gridCellSize * 11 * level + 'px',
      }"
    >
      <div
        class="grid-cell"
        v-for="(v, i) in gridCellOptions"
        :key="i"
        :type="v.type"
        :data-index="v.index"
        :desc="v.desc"
        :style="{ width: gridCellSize + 'px', height: gridCellSize + 'px' }"
        @click="openCell(v.index, v.type, v.desc)"
        @contextmenu.prevent="tabMine(i)"
      >
        <Mine v-show="v.type == 'mine' && v.isOpen == true"></Mine>
        <Flag v-show="v.isTag == true && v.isOpen == false"></Flag>
        <span
          v-show="v.type == 'common' && v.isOpen == true"
          :style="{ fontSize: 60 / level + 'px' }"
          >{{ v.desc }}</span
        >
      </div>
    </div>
    <!-- 游戏开始模态框 -->
    <div class="game-start-container" v-show="startVisibility">
      <div class="game-start">
        <div class="game-start-head">
          <div class="game-start-title">游戏选项</div>
        </div>
        <div class="game-start-body">
          <div class="game-start-option">
            <span>player</span>
            <input class="player-name" type="text" v-model="playerName" />
            <div title="随机生成名字" @click="createRandomName()">
              <Random></Random>
            </div>
          </div>
          <div class="game-start-option">
            <span>难度</span>
            <select class="levels" v-model="level">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
        </div>
        <div class="game-start-foot">
          <div class="game-start-foot-btn" @click="startGame()">确定</div>
        </div>
      </div>
    </div>
    <!-- 游戏结束模态框 -->
    <div class="game-tips-quit-container" v-show="quitVisibility">
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
  </div>
</template>

<script lang="js">
import SweepGameQuitPanel from "./SweepGameQuitPanel.vue";
import SweepGameStartPanel from "./SweepGameStartPanel.vue";
import CloseBlack from "@/components/close-black.vue";
import CloseWhite from "@/components/close-white.vue";
import Mine from "@/components/mine.vue";
import Flag from "@/components/flag.vue";
import Random from "@/components/random.vue"
import { createRandomCNChar } from '@/utils'
export default {
  components: { SweepGameQuitPanel, SweepGameStartPanel, Mine, Flag, CloseBlack, CloseWhite ,Random},
  data() {
    return {
      playerName: '',
      isGameQuit: false,
      level: 1,
      isGameStart: false,
      score: 0,
      usedTime: 0,
      usedTimeIntervalTimer: 0,
      gridCellOptions: [{}],
      gridCellSize: screen.availWidth / 20,
      isCloseHover: false,
      quitVisibility: false,
      startVisibility: false,
      showTagMine: false,
      mineTotalCount: 0,
      tagTotalCount: 0,
    };
  },
  methods: {
    getCache() {
      const playerNames = localStorage.getItem("playerNames");
      const cacheGridOptions = localStorage.getItem('cacheGridOptions')
      this.playerName = playerNames ? JSON.parse(localStorage.getItem("playerNames"))[JSON.parse(localStorage.getItem("playerNames")).length] : ''
      if(cacheGridOptions != '[{}]'){
        this.level = localStorage.getItem('cacheLevel')
        this.gridCellSize = screen.availWidth / (20 * this.level);
        this.gridCellOptions = JSON.parse(cacheGridOptions)
        let tempNumber = 0;
        this.gridCellOptions.forEach((el) => {
          tempNumber = el.isTag ? tempNumber + 1 : tempNumber;
          this.mineTotalCount = el.type == "mine" ? this.mineTotalCount + 1 : this.mineTotalCount;
        });
        this.tagTotalCount = tempNumber;
        this.isGameStart = true
        this.usedTime = localStorage.getItem('cacheUsedTime') || 0
      }
    },
    createRandomName(){
      let name = ''
      let nameLength = parseInt(Math.random() * 3 + 3 )
      for(let i = 0; i < nameLength; i++){
        name += createRandomCNChar()
      }
      this.playerName = name
    },
    openStartPanel() {
      this.startVisibility = true;
    },
    startGame() {
      this.isGameStart = true;
      this.gridCellSize = screen.availWidth / (20 * this.level);
      this.usedTimeIntervalTimer = setInterval(() => {
        this.usedTime++;
      }, 1000);

      for (let i = 1; i <= Math.pow(this.level, 2) * 15 * 8; i++) {
        let type = Math.random() < 0.15 ? "mine" : "common";
        this.mineTotalCount = type == "mine" ? this.mineTotalCount + 1 : this.mineTotalCount;
        let option = {
          type: type,
          desc: "",
          isOpen: false,
          index: i,
          isTag: false,
        };
        this.gridCellOptions.push(option);
      }
      this.gridCellOptions.splice(0, 1);
      this.gridCellOptions.forEach((el, i) => {
        let nearMineCount = 0;
        if (el.type == "common") {
          // 左侧
          if (el.index != 1 || (el.index - 1) % 15 != 0) {
            if (
              this.gridCellOptions[i - (15 * this.level + 1)] &&
              this.gridCellOptions[i - (15 * this.level + 1)].type == "mine"
            ) {
              nearMineCount++;
            }
            if (this.gridCellOptions[i - 1] && this.gridCellOptions[i - 1].type == "mine") {
              nearMineCount++;
            }
            if (
              this.gridCellOptions[i + (15 * this.level - 1)] &&
              this.gridCellOptions[i + (15 * this.level - 1)].type == "mine"
            ) {
              nearMineCount++;
            }
          }
          if (el.index % 15 != 0) {
            // 右侧
            if (
              this.gridCellOptions[i - (15 * this.level - 1)] &&
              this.gridCellOptions[i - (15 * this.level - 1)].type == "mine"
            ) {
              nearMineCount++;
            }
            if (
              this.gridCellOptions[i + (15 * this.level + 1)] &&
              this.gridCellOptions[i + (15 * this.level + 1)].type == "mine"
            ) {
              nearMineCount++;
            }
            if (this.gridCellOptions[i + 1] && this.gridCellOptions[i + 1].type == "mine") {
              nearMineCount++;
            }
          }

          // 中
          if (
            this.gridCellOptions[i - 15 * this.level] &&
            this.gridCellOptions[i - 15 * this.level].type == "mine"
          ) {
            nearMineCount++;
          }
          if (
            this.gridCellOptions[i + 15 * this.level] &&
            this.gridCellOptions[i + 15 * this.level].type == "mine"
          ) {
            nearMineCount++;
          }
        }
        el.desc = nearMineCount;
      });
      this.startVisibility = false;
    },
    restart() {},
    quitGame() {
      this.mineTotalCount = 0
      this.gridCellOptions = [{}];
      this.isGameStart = false;
      clearInterval(this.usedTimeIntervalTimer);
      this.usedTime = 0;
      localStorage.removeItem('cacheGridOptions')
      localStorage.removeItem('cacheUsedTime')
      localStorage.removeItem('cacheLevel')
    },
    closeQuitPanel() {
      this.quitVisibility = false;
    },
    showQuitpanel() {
      setTimeout(() => {
        this.gridCellOptions.forEach(el => {
          el.isOpen = true;
        });
      }, 500);
      this.quitVisibility = true;
    },
    createGrids() {},
    openCell(index, type, desc) {
      this.gridCellOptions[index - 1].isOpen = true;
      if (type == "mine") {
        clearInterval(this.usedTimeIntervalTimer);
        this.showQuitpanel();
      } else {
        if (desc == 0) {
          let i = index - 1;
          if (index != 1 || (index - 1) % 15 != 0) {
            if (this.gridCellOptions[i - (15 * this.level + 1)]) {
              this.gridCellOptions[i - (15 * this.level + 1)].isOpen = true;
            }
            if (this.gridCellOptions[i - 1]) {
              this.gridCellOptions[i - 1].isOpen = true;
            }
            if (this.gridCellOptions[i + (15 * this.level - 1)]) {
              this.gridCellOptions[i + (15 * this.level - 1)].isOpen = true;
            }
          }
          if (index % 15 != 0) {
            // 右侧
            if (this.gridCellOptions[i - (15 * this.level - 1)]) {
              this.gridCellOptions[i - (15 * this.level - 1)].isOpen = true;
            }
            if (this.gridCellOptions[i + (15 * this.level + 1)]) {
              this.gridCellOptions[i + (15 * this.level + 1)].isOpen = true;
            }
            if (this.gridCellOptions[i + 1]) {
              this.gridCellOptions[i + 1].isOpen = true;
            }
          }

          // 中
          if (this.gridCellOptions[i - 15 * this.level]) {
            this.gridCellOptions[i - 15 * this.level].isOpen = true;
          }
          if (this.gridCellOptions[i + 15 * this.level]) {
            this.gridCellOptions[i + 15 * this.level].isOpen = true;
          }
        }
      }
    },
    dealNearNoMine() {},
    tabMine(index) {
      this.gridCellOptions[index].isTag = !this.gridCellOptions[index].isTag;
      let tempNumber = 0;
      this.gridCellOptions.forEach((el) => {
        tempNumber = el.isTag ? tempNumber + 1 : tempNumber;
      });
      this.tagTotalCount = tempNumber;
    },
  },
  mounted() {
    this.getCache()
    window.onbeforeunload = () => {
      localStorage.setItem('cacheGridOptions',JSON.stringify(this.gridCellOptions))
      localStorage.setItem('cacheUsedTime',this.usedTime)
      localStorage.setItem('cacheLevel',this.level)
    }
  },
  watch: {
    "$store.state.isSweepGameQuitPanelShow": function (from, to) {
      console.log(to, from);
    },
  },
};
</script>

<style lang="less">
#sweep {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;

  #sweep-head {
    width: 81%;
    height: 60px;
    line-height: 60px;
    margin: 10px 0;
    user-select: none;
    background-color: rgba(203, 215, 231, 0.5);
    border-radius: 20px;
    box-shadow: inset 18px 18px 30px #d1d9e6, inset -18px -18px 30px #fff;
    display: flex;
    justify-content: space-evenly;
    position: relative;
    .sweep-head-left {
      display: flex;
      div {
        margin-right: 30px;
      }
    }
    .handles {
      display: flex;
      width: 200px;
      justify-content: space-evenly;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      div {
        cursor: pointer;
        &:hover {
          color: #409eff;
        }
      }
    }
  }
  #sweep-body {
    border: 1px solid #000;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    .grid-cell {
      border: 1px solid #000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
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
          transition: 0.5s;
          &:hover {
            background-color: rgba(247, 49, 49, 1);
            color: #fff;
          }
          svg {
            width: 20px;
            height: 20px;
            transition: 0.5s;
            &:hover {
              color: #fff;
            }
          }
        }
      }
    }
  }
  .game-start-container {
    width: 100%;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.2);
    .game-start {
      width: 50%;
      height: 50%;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 20px 10px rgba(0, 0, 0, 0.1);
      background-color: #fff;
      user-select: none;
      .game-start-head {
        padding: 10px 0;
        user-select: none;
        position: relative;
        border-bottom: 1px solid #000;
      }
      .game-start-body {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 20px 0;
        .game-start-option {
          width: 60%;
          display: flex;
          margin-bottom: 20px;
          span {
            width: 50px;
            text-align: right;
            line-height: 30px;
            margin-right: 30px;
          }
          .player-name {
            width: 200px;
            outline: none;
            border: none;
            border-bottom: 1px solid #000;
            padding: 0 10px;
            margin-right: 10px;
            &:focus {
              border: 1px solid #409eff;
              border-radius: 13px;
            }
          }
          svg {
            width: 30px;
            height: 30px;
          }
          .levels {
            width: 200px;
            outline: none;
            border: 1px solid #000;
            text-align: center;
            option {
              height: 30px;
            }
          }
        }
      }
      .game-start-foot {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        .game-start-foot-btn {
          height: 30px;
          width: 80px;
          line-height: 30px;
          text-align: center;
          border: 1px solid #000;
          transition: 0.5s;
          &:hover {
            border-color: #409eff;
          }
        }
      }
    }
  }
}
</style>
