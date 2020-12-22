<template>
  <div
    class="fixed flex flex-col justify-center items-center top-0 left-0 p-4 w-full h-full transform transition-all duration-500"
  >
    <div class="w-full max-w-sm ">
      <div class="p-4 text-center">
        <h1 class="font-bold text-xl text-purple-600 uppercase tracking-wider">Training Mode</h1>
        <div class="pt-2 text-gray-600">Select the training mode you want to start</div>
      </div>
      <div class="p-4 w-full">
        <InputSelect
          v-model="mode"
          label="Training Mode"
          :options="modeOptions"
          @input="mode_required = false"
        />
        <transition enter-class="opacity-0" leave-to-class="opacity-0">
          <div
            v-if="mode_required"
            class="absolute text-xs text-red-500 transition-all duration-500"
          >
            Please select the traning mode
          </div>
        </transition>
      </div>
      <div class="p-4 text-center">
        <button class="btn" @click="onNext">Next</button>
      </div>
      <div class="px-4 pt-10 pb-4 text-sm text-center">
        <router-link :to="{ name: 'Home' }" class="link">Go Back</router-link>
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
      modeOptions: [
        { label: 'Endurance', value: 'endurance' },
        { label: 'Relax', value: 'relax' },
        { label: 'Speed', value: 'speed' },
      ],
      mode: null,
      mode_required: false,
    };
  },
  created() {
    this.mode = this.$store.state.mode;
  },
  methods: {
    onNext() {
      if (this.mode) {
        this.$store.commit('setMode', this.mode);
        this.$router.push({ name: 'Details' });
      } else {
        this.mode_required = true;
      }
    },
  },
};
</script>
