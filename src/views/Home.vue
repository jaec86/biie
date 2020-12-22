<template>
  <div
    class="fixed flex flex-col justify-center items-center top-0 left-0 w-full h-full transform transition-all duration-500"
  >
    <div class="w-full max-w-sm">
      <div class="p-4 text-center">
        <h1 class="font-bold text-3xl text-purple-600 uppercase tracking-wider">Welcome!</h1>
        <div class="pt-2 text-gray-600">Click below to start your training</div>
      </div>
      <div class="p-4 text-center">
        <router-link :to="{ name: 'Mode' }" class="btn">Start Training</router-link>
      </div>
    </div>
  </div>
</template>
