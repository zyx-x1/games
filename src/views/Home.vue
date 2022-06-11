<template>
  <div id="home">
    <div id="notice">
      <span>XYZ</span>
    </div>
    <div id="games">
      <div
        class="game"
        v-for="(v, i) in games"
        :key="i"
        @click="$router.push(v.router)"
      >
        <Tetris v-show="v.key == 'Tetris'"></Tetris>
        <Sweep v-show="v.key == 'Sweep'"></Sweep>
        <span>{{ v.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import Tetris from "@/components/tetris.vue";
import Sweep from "@/components/mine.vue";
export default {
  components: { Tetris, Sweep },
  data() {
    return {
      games: [
        { name: "扫雷", key: "Sweep", router: "/sweep" },
        { name: "俄罗斯方块", key: "Tetris", router: "/tetris" },
      ],
    };
  },
};
</script>

<style lang="less">
#home {
  background-image: radial-gradient(
      closest-side,
      rgba(0, 255, 210, 0.3),
      rgba(156, 112, 215, 0.3)
    ),
    radial-gradient(closest-side, rgba(0, 255, 210, 0.5), rgba(0, 255, 210, 0)),
    radial-gradient(
      closest-side,
      rgba(181, 137, 238, 0.3),
      rgba(0, 255, 210, 0)
    ),
    radial-gradient(
      closest-side,
      rgba(122, 255, 231, 0.3),
      rgba(0, 255, 210, 0)
    ),
    radial-gradient(
      closest-side,
      rgba(183, 141, 238, 1),
      rgba(147, 248, 230, 0)
    ),
    radial-gradient(
      closest-side,
      rgba(49, 252, 215, 0.3),
      rgba(115, 146, 140, 0)
    );
  background-size: 100vw 100vw, 130vmax 130vmax, 80vmax 80vmax, 90vmax 90vmax,
    110vmax 110vmax, 90vmax 90vmax;
  background-position: center, -80vmax -80vmax, 60vmax -30vmax, 10vmax 10vmax,
    -30vmax 10vmax, 50vmax 50vmax;
  background-repeat: no-repeat;
  height: 100vh;
  width: 100vmax;
  display: flex;
  align-items: center;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  animation: bgColorAnime 10s ease-in-out infinite;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  #notice {
    width: 50%;
    background-color: rgba(255, 255, 255, 0.3);
    height: 100px;
    line-height: 100px;
    user-select: none;
    border-radius: 30px;

    text-shadow: 2px 2px 4px #000000;
    span {
      font-size: 50px;
      letter-spacing: 25px;
      color: rgba(255, 255, 255, 0.5);
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 1);
    }
  }
  #games {
    height: 50%;
    width: 80%;
    margin: 0 auto;
    // background-color: rgba(255, 255, 255, 0.3);
    display: flex;
    justify-content: space-evenly;
    .game {
      background-color: rgba(255, 255, 255, 0.3);
      width: 30%;
      height: 240px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-evenly;
      svg {
        width: 150px;
        height: 150px;
        position: relative;
        z-index: 1;
        &:before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(255, 255, 255, 0.1);
          z-index: 2;
        }
      }
      span {
        font-weight: bold;
        font-size: 20px;
        letter-spacing: 2px;
      }
    }
  }
}
@keyframes bgColorAnime {
  0%,
  100% {
    background-size: 100vw 100vw, 130vmax 130vmax, 80vmax 80vmax, 90vmax 90vmax,
      110vmax 110vmax, 90vmax 90vmax;
    background-position: center, -80vmax -80vmax, 60vmax -30vmax, 10vmax 10vmax,
      -30vmax 10vmax, 50vmax 50vmax;
  }
  25% {
    background-size: 100vw 100vw, 110vmax 110vmax, 100vmax 100vmax,
      120vmax 120vmax, 90vmax 90vmax, 100vmax 100vmax;
    background-position: center, -60vmax -60vmax, 70vmax -20vmax, 0vmax 0vmax,
      -40vmax 30vmax, 20vmax 70vmax;
  }
  50% {
    background-size: 100vw 100vw, 100vmax 130vmax, 70vmax 70vmax,
      130vmax 130vmax, 110vmax 110vmax, 90vmax 90vmax;
    background-position: center, 10vmax 10vmax, 50vmax -50vmax, 20vmax 10vmax,
      -10vmax 40vmax, 30vmax 40vmax;
  }
  75% {
    background-size: 100vw 100vw, 70vmax 130vmax, 90vmax 70vmax, 110vmax 110vmax,
      130vmax 70vmax, 110vmax 120vmax;
    background-position: center, -50vmax -50vmax, 50vmax -20vmax, 20vmax 20vmax,
      20vmax 0vmax, 40vmax 40vmax;
  }
}
</style>
