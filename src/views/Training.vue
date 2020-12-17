<template>
  <div
    class="fixed flex flex-col justify-center items-center top-0 left-0 p-4 w-full h-full transform transition-all duration-500"
  >
    <div class="p-4 text-center">
      <h1 class="font-bold text-xl text-purple-600 uppercase tracking-wider">Training Mode</h1>
      <div class="pt-2 text-gray-600">Select the training mode you want to start</div>
    </div>
    <div class="p-4 text-center">
      <button class="btn w-40">Speed</button>
    </div>
    <div class="p-4 text-center">
      <button class="btn w-40">Endurance</button>
    </div>
    <div class="p-4 text-center">
      <button class="btn w-40">Relax</button>
    </div>
    <div class="px-4 pt-10 pb-4 text-sm">
      <router-link :to="{ name: 'Home' }" class="link">Return Home</router-link>
    </div>
  </div>
</template>
