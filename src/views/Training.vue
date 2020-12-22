<template>
  <div
    class="fixed flex flex-col justify-between items-center top-0 left-0 p-4 w-full h-full transform transition-all duration-500"
  >
    <div id="container" class="absolute inset-0"></div>
    <div class="relative p-4 text-center">
      <h1 class="font-bold text-xl text-purple-600 uppercase tracking-wider">Training</h1>
    </div>
    <div class="relative">
      <div class="px-4 pb-8 text-center">
        <button class="btn" @click="onFinish">Finish</button>
      </div>
      <div class="w-full font-bold text-sm text-purple-800 text-center uppercase tracking-wider">
        Time Remaining
      </div>
      <VueCountdown
        tag="div"
        class="flex items-center p-4 font-bold text-xl"
        :time="time"
        :interval="100"
      >
        <template slot-scope="props">
          <div class="mx-auto w-10 text-center">{{ props.minutes }}</div>
          <span>:</span>
          <div class="mx-auto w-10 text-center">{{ props.seconds }}</div>
          <span>:</span>
          <div class="mx-auto w-14 text-center">
            {{ props.seconds }}.{{ Math.floor(props.milliseconds / 100) }}
          </div>
        </template>
      </VueCountdown>
    </div>
  </div>
</template>

<style>
canvas {
  width: 96vw;
  min-height: 96vh;
  position: absolute;
  top: 2%;
  left: 2%;
  background: transparent;
  cursor: pointer;
}
</style>

<script>
import VueCountdown from '@chenfengyuan/vue-countdown';
import { loadGLTF, start } from '../webgl';
import moment from 'moment';

export default {
  components: {
    VueCountdown,
  },
  data() {
    return {
      time: null,
    };
  },
  created() {
    let time = this.$store.state.time || 30;
    this.time = moment()
      .add(time, 'minutes')
      .diff(moment());
    loadGLTF('human-running.glb').then(start);
  },
  methods: {
    onFinish() {
      this.$store.commit('setTime', null);
      this.$store.commit('setDistance', null);
      this.$store.commit('setTraining', null);
      this.$store.commit('setStory', null);
      this.$router.push({ name: 'Home' });
    },
  },
};
</script>
