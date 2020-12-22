<template>
  <div
    class="fixed flex flex-col justify-center items-center top-0 left-0 p-4 w-full h-full transform transition-all duration-500"
  >
    <div class="w-full max-w-sm">
      <div class="p-4 text-center">
        <h1 class="font-bold text-xl text-purple-600 uppercase tracking-wider">Training Details</h1>
        <div class="pt-2 text-gray-600">
          Fill in the time and distance you want the training to last
        </div>
      </div>
      <div class="p-4 w-full">
        <InputSelect
          v-model="time"
          label="Time"
          :options="timeOptions"
          @input="time_required = false"
        />
        <transition enter-class="opacity-0" leave-to-class="opacity-0">
          <div
            v-if="time_required"
            class="absolute text-xs text-red-500 transition-all duration-500"
          >
            Please select the time
          </div>
        </transition>
      </div>
      <div class="p-4 w-full">
        <InputSelect
          v-model="distance"
          label="Distance"
          :options="distanceOptions"
          @input="distance_required = false"
        />
        <transition enter-class="opacity-0" leave-to-class="opacity-0">
          <div
            v-if="distance_required"
            class="absolute text-xs text-red-500 transition-all duration-500"
          >
            Please select the distance
          </div>
        </transition>
      </div>
      <div class="p-4 text-center">
        <button class="btn" @click="onNext">Next</button>
      </div>
      <div class="px-4 pt-10 pb-4 text-sm text-center">
        <router-link :to="{ name: 'Mode' }" class="link">Go Back</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import InputSelect from '@/components/InputSelect';

export default {
  components: {
    InputSelect,
  },
  data() {
    return {
      timeOptions: [
        { value: 15, label: '15 Minutes' },
        { value: 30, label: '30 Minutes' },
        { value: 45, label: '45 Minutes' },
        { value: 60, label: '60 Minutes' },
      ],
      distanceOptions: [
        { value: 2.5, label: '2.5 Km' },
        { value: 5, label: '5 Km' },
        { value: 7.5, label: '7.5 Km' },
        { value: 10, label: '10 Km' },
      ],
      time: null,
      distance: null,
      time_required: false,
      distance_required: false,
    };
  },
  created() {
    this.time = this.$store.state.time;
    this.distance = this.$store.state.distance;
  },
  methods: {
    onNext() {
      if (this.time && this.distance) {
        this.$store.commit('setTime', this.time);
        this.$store.commit('setDistance', this.distance);
        this.$router.push({ name: 'Story' });
      } else {
        if (!this.time) {
          this.time_required = true;
        }
        if (!this.distance) {
          this.distance_required = true;
        }
      }
    },
  },
};
</script>
