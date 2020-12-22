<template>
  <div
    class="fixed flex flex-col justify-center items-center top-0 left-0 p-4 w-full h-full transform transition-all duration-500"
  >
    <div class="w-full max-w-sm">
      <div class="p-4 text-center">
        <h1 class="font-bold text-xl text-purple-600 uppercase tracking-wider">Story Mode</h1>
        <div class="pt-2 text-gray-600">Select the story mode you want for your training</div>
      </div>
      <div class="p-4 w-full">
        <InputSelect
          v-model="story"
          label="Story"
          :options="storyOptions"
          @input="story_required = false"
        />
        <transition enter-class="opacity-0" leave-to-class="opacity-0">
          <div
            v-if="story_required"
            class="absolute text-xs text-red-500 transition-all duration-500"
          >
            Please select the story mode
          </div>
        </transition>
      </div>
      <div class="p-4 text-center">
        <router-link :to="{ name: 'Training' }" class="btn">Next</router-link>
      </div>
      <div class="px-4 pt-10 pb-4 text-sm text-center">
        <router-link :to="{ name: 'Details' }" class="link">Go Back</router-link>
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
      storyOptions: [
        { label: 'Zombie', value: 'zombie' },
        { label: 'Rocky', value: 'rocky' },
        { label: 'Mission Impossoble', value: 'mission_impossible' },
      ],
      story: null,
      story_required: false,
    };
  },
  created() {
    this.story = this.$store.state.story;
  },
  methods: {
    onNext() {
      if (this.mode) {
        this.$store.commit('setStory', this.mode);
        this.$router.push({ name: 'Training' });
      } else {
        this.story_required = true;
      }
    },
  },
};
</script>
