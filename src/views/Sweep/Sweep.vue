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
      <div v-if="isGameStart">用时：{{ usedTime }}s</div>
      <div v-else @click="rankVisibility = true" class="rank-list">排行榜</div>
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
        :data-index="v.index"
        :style="{ width: gridCellSize + 'px', height: gridCellSize + 'px' }"
        @click="openCell(v.index, v.type, v.desc)"
        @contextmenu.prevent="tabMine(i)"
      >
        <Mine
          :style="{
            width: gridCellSize / 2 + 'px',
            height: gridCellSize / 2 + 'px',
          }"
          v-show="v.type == 'mine' && v.isOpen == true"
        ></Mine>
        <Flag
          :style="{
            width: gridCellSize / 2 + 'px',
            height: gridCellSize / 2 + 'px',
          }"
          v-show="v.isTag == true && v.isOpen == false"
        ></Flag>
        <span
          v-show="v.type == 'common' && v.isOpen == true"
          :style="{ fontSize: 40 / level + 'px' }"
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
          <div class="game-tips-quit-title">
            <b v-if="isWin">胜利</b><b v-else>失败</b>
          </div>
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
        <div class="game-tips-quit-body">
          <img
            v-show="overStatus == 'win'"
            src="../../assets/gameover/WIN.gif"
            alt=""
          />
          <img
            v-show="overStatus == 'defeat1'"
            src="../../assets/gameover/defeat1.jpg"
            alt=""
          />
          <img
            v-show="overStatus == 'defeat2'"
            src="../../assets/gameover/defeat2.jpg"
            alt=""
          />
          <img
            v-show="overStatus == 'defeat3'"
            src="../../assets/gameover/defeat3.png"
            alt=""
          />
          <img
            v-show="overStatus == 'overInFirstStep'"
            src="../../assets/gameover/overInFirstStep.jpg"
            alt=""
          />
          <span>player：{{ playerName }}</span>
          <span>得分：{{ score }}</span>
          <span v-if="isWin">666</span>
          <span v-else>我的评价是：{{ evaluation }}</span>
        </div>
        <div class="game-tips-quit-foot">
          <div class="game-tips-quit-btn" @click="quitGame()">结束</div>
        </div>
      </div>
    </div>
    <!-- 排行榜 -->
    <div class="rank-container" v-show="rankVisibility">
      <div class="rank">
        <div class="rank-head">
          <div class="rank-title">排行榜</div>
          <div
            class="rank-close"
            @mouseover="isCloseHover = true"
            @mouseleave="isCloseHover = false"
            @click="rankVisibility = false"
          >
            <CloseBlack v-show="!isCloseHover"></CloseBlack>
            <CloseWhite v-show="isCloseHover"></CloseWhite>
          </div>
        </div>
        <div class="rank-body">
          <div
            class="rank-item"
            v-for="(v, i) in rankData"
            :key="i"
            :title="'时间：' + v.time + '   |   LEVEL：' + v.level"
          >
            <span class="rank-item-index">{{ i + 1 }}</span>

            <span>{{ v.player }}</span>
            <span>{{ v.score }}分</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CloseBlack from "@/components/close-black.vue";
import CloseWhite from "@/components/close-white.vue";
import Mine from "@/components/mine.vue";
import Flag from "@/components/flag.vue";
import Random from "@/components/random.vue";
import { createRandomCNChar, formatTime } from "@/utils";
export default {
  components: { Mine, Flag, CloseBlack, CloseWhite, Random },
  data() {
    return {
      isWin: false,
      playerName: "",
      isGameQuit: false,
      level: 1,
      isGameStart: false,
      score: 0,
      usedTime: 0,
      usedTimeIntervalTimer: 0,
      gridCellOptions: [],
      gridCellSize: screen.availWidth / 20,
      isCloseHover: false,
      quitVisibility: false,
      startVisibility: false,
      rankVisibility: false,
      showTagMine: false,
      mineTotalCount: 0,
      tagTotalCount: 0,
      rankData: [],
      stepCount: 0,
      overStatus: "",
      evaluation: "",
    };
  },
  methods: {
    getRankData() {
      let records = [];
      if (localStorage.getItem("allSweepRecords")) {
        records = JSON.parse(localStorage.getItem("allSweepRecords"));
        let len = records.length;
        for (let i = 0; i < len; i++) {
          for (let j = 0; j + 1 < len - i; j++) {
            if (records[j + 1].score > records[j].score) {
              [records[j], records[j + 1]] = [records[j + 1], records[j]];
            }
          }
        }
        records = records.splice(0, 10);
      }
      this.rankData = records;
    },
    // 获取缓存的数据信息，防止页面刷新后重置
    getCache() {
      const playerNames = localStorage.getItem("playerNames");
      const cacheGridOptions = localStorage.getItem("cacheGridOptions");
      this.playerName = playerNames
        ? JSON.parse(localStorage.getItem("playerNames"))[
            JSON.parse(localStorage.getItem("playerNames")).length
          ]
        : "";
      if (cacheGridOptions != "[]" && cacheGridOptions) {
        this.level = localStorage.getItem("cacheLevel");
        this.gridCellSize = screen.availWidth / (20 * this.level);
        this.gridCellOptions = JSON.parse(cacheGridOptions);
        let tempNumber = 0;
        this.gridCellOptions.forEach((el) => {
          tempNumber = el.isTag ? tempNumber + 1 : tempNumber;
          this.mineTotalCount =
            el.type == "mine" ? this.mineTotalCount + 1 : this.mineTotalCount;
        });
        this.tagTotalCount = tempNumber;
        this.isGameStart = true;
        this.usedTime = localStorage.getItem("cacheUsedTime") || 0;
        this.playerName = localStorage.getItem("cachePlayerName");
        this.usedTimeIntervalTimer = setInterval(() => {
          this.usedTime++;
        }, 1000);
      }
    },
    // 随机生成名字
    createRandomName() {
      let name = "";
      let nameLength = parseInt(Math.random() * 3 + 3);
      for (let i = 0; i < nameLength; i++) {
        name += createRandomCNChar();
      }
      this.playerName = name;
    },
    // 打开游戏开始面板
    openStartPanel() {
      this.startVisibility = true;
      this.playerName = !!localStorage.getItem("prevPlayerName")
        ? localStorage.getItem("prevPlayerName")
        : "";
    },
    // 游戏开始
    startGame() {
      if (!this.playerName) {
        this.createRandomName();
      }
      clearInterval(this.usedTimeIntervalTimer);
      this.mineTotalCount = 0;
      this.stepCount = 0;
      this.isGameStart = true;
      this.gridCellOptions = [];
      this.usedTime = 0;
      this.gridCellSize = screen.availWidth / (20 * this.level);
      this.usedTimeIntervalTimer = setInterval(() => {
        this.usedTime++;
      }, 1000);
      for (let i = 1; i <= Math.pow(this.level, 2) * 15 * 8; i++) {
        let type = Math.random() < 0.15 ? "mine" : "common";
        this.mineTotalCount =
          type == "mine" ? this.mineTotalCount + 1 : this.mineTotalCount;
        let option = {
          type: type,
          desc: "",
          isOpen: false,
          index: i,
          isTag: false,
        };
        this.gridCellOptions.push(option);
      }
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
            if (
              this.gridCellOptions[i - 1] &&
              this.gridCellOptions[i - 1].type == "mine"
            ) {
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
            if (
              this.gridCellOptions[i + 1] &&
              this.gridCellOptions[i + 1].type == "mine"
            ) {
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
    // 重新开始
    restart() {
      this.startGame();
    },
    // 结束游戏
    quitGame() {
      this.quitVisibility = false;
      this.isGameStart = false;
      this.gridCellOptions = [];
      this.mineTotalCount = 0;
      this.tagTotalCount = 0;
    },
    // 关闭游戏结束面板
    closeQuitPanel() {
      this.quitVisibility = false;
    },
    // 打开游戏结束面板
    showQuitpanel(bool) {
      let timeScore = 0;
      if (bool) {
        this.overStatus = "win";
        timeScore = (120 * this.level - this.usedTime) * 10;
      }
      let tempScore = 0;
      this.gridCellOptions.forEach((el) => {
        if (el.isOpen == true && el.type != "mine") tempScore++;
        if (el.type == "mine" && el.isTag == true) tempScore++;
      });
      this.score = tempScore + timeScore;
      clearInterval(this.usedTimeIntervalTimer);
      localStorage.removeItem("cacheGridOptions");
      localStorage.removeItem("cacheUsedTime");
      localStorage.removeItem("cacheLevel");
      localStorage.setItem("prevPlayerName", this.playerName);
      let records = JSON.parse(localStorage.getItem("allSweepRecords")) || [];
      records.push({
        player: this.playerName,
        score: this.score,
        level: this.level,
        time: formatTime(new Date()),
      });
      let len = records.length;
      for (let i = 1; i < len; i++) {
        for (let j = i; j < len - i; j++) {
          if (records[j - 1].score < records[j].score) {
            [records[j], records[j - 1]] = [records[j - 1], records[j]];
          }
        }
      }
      localStorage.removeItem("allSweepRecords");
      localStorage.setItem("allSweepRecords", JSON.stringify(records));
      setTimeout(() => {
        this.gridCellOptions.forEach((el) => {
          el.isOpen = true;
        });
      }, 500);
      this.quitVisibility = true;
    },
    createGrids() {},
    // 是否通关
    handleGameResult(index, desc) {
      if (!(this.gridCellOptions instanceof Array)) return;
      let bool = true;
      this.gridCellOptions.forEach((el) => {
        if (el.type == "common") {
          if (el.isOpen == false) {
            bool = false;
          }
        }
      });
      this.isWin = bool;
      if (this.isWin) {
        this.showQuitpanel(true);
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
    // 点击打开单元格
    openCell(index, type, desc) {
      this.gridCellOptions[index - 1].isOpen = true;
      this.stepCount++;
      if (type == "mine") {
        clearInterval(this.usedTimeIntervalTimer);
        this.showQuitpanel(false);
        this.overStatus =
          this.stepCount == 1
            ? "overInFirstStep"
            : "defeat" + Math.ceil(Math.random() + 2);
        this.evaluation = this.stepCount == 1 ? "纯纯的倒霉蛋" : "想笑";
      } else {
        this.handleGameResult(index, desc);
      }
    },
    dealNearNoMine() {},
    // 右键单击标记
    tabMine(index) {
      this.gridCellOptions[index].isTag = !this.gridCellOptions[index].isTag;
      let tempNumber = 0;
      this.gridCellOptions.forEach((el) => {
        tempNumber = el.isTag ? tempNumber + 1 : tempNumber;
      });
      this.tagTotalCount = tempNumber;
    },
    // 设置缓存数据信息
    setCache() {
      localStorage.setItem(
        "cacheGridOptions",
        JSON.stringify(this.gridCellOptions)
      );
      localStorage.setItem("cacheUsedTime", this.usedTime);
      localStorage.setItem("cacheLevel", this.level);
      localStorage.setItem("cachePlayerName", this.playerName);
    },
  },
  mounted() {
    this.getCache();
    this.getRankData();
    window.onbeforeunload = () => {
      this.setCache();
    };
  },
  watch: {
    "$route.fullPath": function (from, to) {
      console.log(to, from);
    },
  },
};
</script>

<style lang="less">
.full-justified {
  display: flex;
  justify-content: space-between;
}
.w40_ {
  width: 40%;
}
#sweep {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  background: #00416a; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to right,
    #e4e5e6,
    #00416a
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #e4e5e6,
    #00416a
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

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
    .rank-list {
      cursor: pointer;
      &:hover {
        color: #409eff;
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
    border-radius: 5px;
    background: transparent;
    box-shadow: inset 7px 7px 14px #f5f5f5, inset -7px -7px 14px #ffffff;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    .grid-cell {
      border: 1px solid #000;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      color: #fff;
      user-select: none;
      cursor: default;
      svg {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
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
      height: 40%;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 20px 10px rgba(0, 0, 0, 0.1);
      background-color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
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
      .game-tips-quit-body {
        display: flex;
        flex-direction: column;
        img {
          width: 100px;
          height: 100px;
          margin: 0 auto;
        }
        span {
          margin: 10px;
          font-weight: bold;
          cursor: default;
        }
      }
      .game-tips-quit-foot {
        border-top: 1px solid #000;
        .game-tips-quit-btn {
          width: 100px;
          padding: 5px 20px;
          margin: 5px auto;
          cursor: default;
          border: 1px solid #000;
          &:hover {
            border-color: #409eff;
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
  .rank-container {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.3);
    .rank {
      width: 50%;
      height: 80%;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 20px 10px rgba(0, 0, 0, 0.1);
      background-color: #fff;
      user-select: none;
      .rank-head {
        padding: 10px 0;
        user-select: none;
        position: relative;
        border-bottom: 1px solid #000;
        .rank-close {
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
      .rank-body {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-evenly;
        .rank-item {
          width: 60%;
          border: 1px solid #409eff;
          margin: 8px 0;
          padding: 10px 10px;
          border-radius: 13px;
          display: flex;
          justify-content: space-between;
          &:nth-child(1) {
            border-color: gold;
            box-shadow: 0 0 2px 1px rgba(255, 215, 0, 0.5);
          }
          &:nth-child(2) {
            border-color: rgb(177, 168, 168);
            box-shadow: 0 0 2px 1px rgba(192, 192, 192, 0.5);
          }
          &:nth-child(3) {
            border-color: rgb(198, 145, 69);
            box-shadow: 0 0 2px 1px rgba(192, 192, 192, 0.5);
          }
          .rank-item-date {
            font-size: 12px;
          }
        }
      }
    }
  }
}
</style>
