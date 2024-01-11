<template>
  <div>
    <Data>
      <NuxtPage />
    </Data>
  </div>
  <div class="admin-code fixed bottom-0 right-3 z-[99999]">
    <div class="code mb-6">
      <h3
        class="text-xl font-bold mb-3 ms-3 select-none cursor-pointer"
        @click="showCustomCode = !showCustomCode"
      >
        Code
      </h3>
      <textarea
        v-model="customCode"
        v-show="showCustomCode"
        @keydown.shift.enter.prevent="runcustomCode"
        class="mr-3 max-w-[90vw] max-h-[28rem] w-full resize bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="Enter script"
      />
    </div>
  </div>
</template>
<script setup>
useHead({
  title: 'Transformer Column',
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }],
});

const customCode = ref('');
const showCustomCode = ref(false);
async function runcustomCode() {
  try {
    await eval(customCode.value);
  } catch (error) {
    console.error('Evaluation failed: Custom code\n' + error);
  }
}
</script>
