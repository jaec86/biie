<template>
  <div id="app">
    <transition :enter-class="enterClass" :leave-to-class="leaveToClass">
      <router-view />
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      enterClass: 'translate-x-full opacity-0',
      leaveToClass: '-translate-x-full opacity-0',
    };
  },
  watch: {
    $route(to, from) {
      console.log('hola');
      if (to.meta.order > from.meta.order) {
        this.enterClass = 'translate-x-full opacity-0';
        this.leaveToClass = '-translate-x-full opacity-0';
      } else {
        this.enterClass = '-translate-x-full opacity-0';
        this.leaveToClass = 'translate-x-full opacity-0';
      }
    },
  },
};
</script>
