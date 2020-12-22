<template>
  <div class="relative w-full transition-all duration-500" :class="{ 'opacity-50': realDisabled }">
    <label
      v-if="label"
      class="text-xs text-gray-400 uppercase tracking-wider transition-all duration-500"
      :class="{
        'text-purple-600': (focused || hovered) && !realDisabled,
      }"
    >
      {{ label }}
    </label>
    <div
      ref="input"
      tabindex="0"
      class="relative px-4 py-3 w-full border rounded outline-none focus:outline-none transition-all duration-500"
      :class="{
        'border-purple-600': (focused || hovered) && !realDisabled,
      }"
      @focus="focused = true"
      @blur="focused = false"
      @mouseover="hovered = true"
      @mouseout="hovered = false"
    >
      <span
        :class="{
          'opacity-50': !realValue,
        }"
      >
        {{ realValue || placeholder }}
      </span>
      <svg
        aria-hidden="true"
        focusable="false"
        data-prefix="fal"
        data-icon="chevron-down"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
        class="absolute top-1/2 right-0 w-4 transform -translate-y-1/2 -translate-x-4 transition-all duration-500"
        :class="{
          'text-purple-600': (focused || hovered) && !realDisabled,
        }"
      >
        <path
          fill="currentColor"
          d="M443.5 162.6l-7.1-7.1c-4.7-4.7-12.3-4.7-17 0L224 351 28.5 155.5c-4.7-4.7-12.3-4.7-17 0l-7.1 7.1c-4.7 4.7-4.7 12.3 0 17l211 211.1c4.7 4.7 12.3 4.7 17 0l211-211.1c4.8-4.7 4.8-12.3.1-17z"
        ></path>
      </svg>
      <transition enter-class="opacity-0" leave-to-class="opacity-0">
        <div
          v-if="options && focused"
          class="absolute left-0 w-full rounded border border-purple-600 bg-white text-xm z-10 transition-all duration-500"
          style="top: 3rem"
        >
          <div
            v-for="(option, index) in options"
            :key="`option${index}`"
            class="p-2 cursor-pointer transition-all duration-500"
            :class="{
              'bg-purple-400 text-white': value === option.value,
            }"
            @click="selectOption(option.value)"
          >
            {{ option.label }}
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    disabled: {
      default: false,
      type: Boolean,
    },
    label: {
      default: null,
      type: String,
    },
    options: {
      default: null,
      type: Array,
    },
    placeholder: {
      default: 'Select an option',
      type: String,
    },
    value: {
      default: null,
      type: [String, Number],
    },
  },
  data() {
    return {
      focused: false,
      hovered: false,
    };
  },
  computed: {
    realDisabled() {
      return this.disabled;
    },
    realValue() {
      return this.options.find(o => o.value === this.value)?.label;
    },
  },
  methods: {
    selectOption(value) {
      this.$refs.input.blur();
      this.focused = false;
      this.hovered = false;
      this.$emit('input', value);
    },
  },
};
</script>
