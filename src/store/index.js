import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    mode: null,
    time: null,
    distance: null,
    story: null,
  },
  mutations: {
    setMode(state, mode) {
      state.mode = mode;
    },
    setTime(state, time) {
      state.time = time;
    },
    setDistance(state, distance) {
      state.distance = distance;
    },
    setStory(state, story) {
      state.story = story;
    },
  },
});
