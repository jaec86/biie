<template>
  <div class="relative transition-all duration-500" :class="{ 'opacity-50': realDisabled }">
    <label
      v-if="label"
      class="text-xs uppercase tracking-wider transition-all duration-500"
    >
      {{ label }}
    </label>
  </div>
</template>
